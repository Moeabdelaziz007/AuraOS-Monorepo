"""
AI Command Sender Module

This module provides communication with AI providers (OpenAI GPT, Google Gemini, Anthropic Claude)
to send commands and receive responses for processing into BASIC-M6502 commands.
"""

import asyncio
import hashlib
import json
import time
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Tuple, Union

import httpx
from loguru import logger

from bridge.core.error_handler import (
    BridgeError,
    ErrorCategory,
    ErrorHandler,
    ErrorSeverity,
)
from bridge.core.settings import get_settings


class AIProvider(ABC):
    """Abstract base class for AI providers."""

    def __init__(self, name: str, config: Dict[str, Any]):
        """Initialize AI provider."""
        self.name = name
        self.config = config
        self.api_key = config.get("api_key", "")
        self.model = config.get("model", "")
        self.max_tokens = config.get("max_tokens", 4000)
        self.temperature = config.get("temperature", 0.7)
        self.timeout = config.get("timeout", 30)
        self.retry_attempts = config.get("retry_attempts", 3)
        self.fallback_model = config.get("fallback_model")

        self.error_handler = ErrorHandler()
        self.request_count = 0
        self.last_request_time = 0.0
        self.rate_limit_remaining = 60  # Default rate limit

    @abstractmethod
    async def send_request(
        self, prompt: str, context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Send request to AI provider."""
        pass

    @abstractmethod
    def _build_request_payload(
        self, prompt: str, context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Build request payload for the provider."""
        pass

    @abstractmethod
    def _parse_response(self, response_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse response from the provider."""
        pass

    def _check_rate_limit(self) -> bool:
        """Check if we can make a request based on rate limits."""
        current_time = time.time()

        # Simple rate limiting check
        if current_time - self.last_request_time < 1.0:  # 1 second between requests
            return False

        return self.rate_limit_remaining > 0

    def _update_rate_limit(self, response_headers: Optional[Dict[str, str]] = None):
        """Update rate limit information from response headers."""
        if response_headers:
            # Update rate limit info if provided in headers
            self.rate_limit_remaining = int(
                response_headers.get("x-ratelimit-remaining", self.rate_limit_remaining)
            )

        self.request_count += 1
        self.last_request_time = time.time()


class OpenAIProvider(AIProvider):
    """OpenAI GPT provider implementation."""

    def __init__(self, config: Dict[str, Any]):
        super().__init__("openai", config)
        self.base_url = "https://api.openai.com/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    async def send_request(
        self, prompt: str, context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Send request to OpenAI API."""
        if not self._check_rate_limit():
            raise BridgeError(
                message="Rate limit exceeded for OpenAI provider",
                category=ErrorCategory.COMMUNICATION,
                severity=ErrorSeverity.MEDIUM,
            )

        payload = self._build_request_payload(prompt, context)

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    self.base_url, headers=self.headers, json=payload
                )

                self._update_rate_limit(response.headers)

                if response.status_code == 200:
                    response_data = response.json()
                    return self._parse_response(response_data)
                else:
                    error_msg = (
                        f"OpenAI API error: {response.status_code} - {response.text}"
                    )
                    raise BridgeError(
                        message=error_msg,
                        category=ErrorCategory.COMMUNICATION,
                        severity=ErrorSeverity.HIGH,
                        context={
                            "status_code": response.status_code,
                            "response": response.text,
                        },
                    )

            except httpx.TimeoutException:
                raise BridgeError(
                    message="OpenAI API timeout",
                    category=ErrorCategory.COMMUNICATION,
                    severity=ErrorSeverity.MEDIUM,
                )
            except Exception as e:
                raise BridgeError(
                    message=f"OpenAI API request failed: {str(e)}",
                    category=ErrorCategory.COMMUNICATION,
                    severity=ErrorSeverity.HIGH,
                )

    def _build_request_payload(
        self, prompt: str, context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Build OpenAI API request payload."""
        system_message = """You are an AI assistant that helps convert natural language instructions into BASIC-M6502 commands for a vintage computer emulator.

Your responses should:
1. Be clear and concise
2. Use proper BASIC-M6502 syntax
3. Include line numbers (10, 20, 30, etc.)
4. Focus on the specific request
5. Provide executable commands

Examples:
- "Print hello" → 10 PRINT "hello"
- "Set x to 5" → 10 LET X = 5
- "Loop from 1 to 10" → 10 FOR I = 1 TO 10
20 PRINT I
30 NEXT I

Always respond with valid BASIC-M6502 commands only."""

        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt},
        ]

        # Add context if provided
        if context:
            context_msg = f"Additional context: {json.dumps(context, indent=2)}"
            messages.append({"role": "system", "content": context_msg})

        return {
            "model": self.model,
            "messages": messages,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
            "stream": False,
        }

    def _parse_response(self, response_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse OpenAI API response."""
        try:
            choices = response_data.get("choices", [])
            if not choices:
                raise BridgeError(
                    message="No choices in OpenAI response",
                    category=ErrorCategory.COMMUNICATION,
                    severity=ErrorSeverity.MEDIUM,
                )

            message = choices[0].get("message", {})
            content = message.get("content", "").strip()

            usage = response_data.get("usage", {})

            return {
                "success": True,
                "content": content,
                "model": response_data.get("model", self.model),
                "usage": {
                    "prompt_tokens": usage.get("prompt_tokens", 0),
                    "completion_tokens": usage.get("completion_tokens", 0),
                    "total_tokens": usage.get("total_tokens", 0),
                },
                "finish_reason": choices[0].get("finish_reason", "unknown"),
                "provider": "openai",
            }

        except Exception as e:
            raise BridgeError(
                message=f"Failed to parse OpenAI response: {str(e)}",
                category=ErrorCategory.COMMUNICATION,
                severity=ErrorSeverity.MEDIUM,
            )


class GoogleProvider(AIProvider):
    """Google Gemini provider implementation."""

    def __init__(self, config: Dict[str, Any]):
        super().__init__("google", config)
        self.base_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"
        self.headers = {"Content-Type": "application/json"}

    async def send_request(
        self, prompt: str, context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Send request to Google Gemini API."""
        if not self._check_rate_limit():
            raise BridgeError(
                message="Rate limit exceeded for Google provider",
                category=ErrorCategory.COMMUNICATION,
                severity=ErrorSeverity.MEDIUM,
            )

        payload = self._build_request_payload(prompt, context)

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    f"{self.base_url}?key={self.api_key}",
                    headers=self.headers,
                    json=payload,
                )

                self._update_rate_limit(response.headers)

                if response.status_code == 200:
                    response_data = response.json()
                    return self._parse_response(response_data)
                else:
                    error_msg = f"Google Gemini API error: {response.status_code} - {response.text}"
                    raise BridgeError(
                        message=error_msg,
                        category=ErrorCategory.COMMUNICATION,
                        severity=ErrorSeverity.HIGH,
                        context={
                            "status_code": response.status_code,
                            "response": response.text,
                        },
                    )

            except httpx.TimeoutException:
                raise BridgeError(
                    message="Google Gemini API timeout",
                    category=ErrorCategory.COMMUNICATION,
                    severity=ErrorSeverity.MEDIUM,
                )
            except Exception as e:
                raise BridgeError(
                    message=f"Google Gemini API request failed: {str(e)}",
                    category=ErrorCategory.COMMUNICATION,
                    severity=ErrorSeverity.HIGH,
                )

    def _build_request_payload(
        self, prompt: str, context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Build Google Gemini API request payload."""
        system_instruction = """You are an AI assistant that helps convert natural language instructions into BASIC-M6502 commands for a vintage computer emulator.

Your responses should:
1. Be clear and concise
2. Use proper BASIC-M6502 syntax
3. Include line numbers (10, 20, 30, etc.)
4. Focus on the specific request
5. Provide executable commands

Examples:
- "Print hello" → 10 PRINT "hello"
- "Set x to 5" → 10 LET X = 5
- "Loop from 1 to 10" → 10 FOR I = 1 TO 10
20 PRINT I
30 NEXT I

Always respond with valid BASIC-M6502 commands only."""

        # Add context to prompt if provided
        full_prompt = prompt
        if context:
            context_str = json.dumps(context, indent=2)
            full_prompt = f"Context: {context_str}\n\nRequest: {prompt}"

        return {
            "contents": [{"parts": [{"text": full_prompt}]}],
            "generationConfig": {
                "temperature": self.temperature,
                "maxOutputTokens": self.max_tokens,
            },
            "systemInstruction": {"parts": [{"text": system_instruction}]},
        }

    def _parse_response(self, response_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse Google Gemini API response."""
        try:
            candidates = response_data.get("candidates", [])
            if not candidates:
                raise BridgeError(
                    message="No candidates in Google Gemini response",
                    category=ErrorCategory.COMMUNICATION,
                    severity=ErrorSeverity.MEDIUM,
                )

            candidate = candidates[0]
            content = candidate.get("content", {})
            parts = content.get("parts", [])

            if not parts:
                raise BridgeError(
                    message="No content parts in Google Gemini response",
                    category=ErrorCategory.COMMUNICATION,
                    severity=ErrorSeverity.MEDIUM,
                )

            text_content = parts[0].get("text", "").strip()

            usage_metadata = response_data.get("usageMetadata", {})

            return {
                "success": True,
                "content": text_content,
                "model": self.model,
                "usage": {
                    "prompt_tokens": usage_metadata.get("promptTokenCount", 0),
                    "completion_tokens": usage_metadata.get("candidatesTokenCount", 0),
                    "total_tokens": usage_metadata.get("totalTokenCount", 0),
                },
                "finish_reason": candidate.get("finishReason", "unknown"),
                "provider": "google",
            }

        except Exception as e:
            raise BridgeError(
                message=f"Failed to parse Google Gemini response: {str(e)}",
                category=ErrorCategory.COMMUNICATION,
                severity=ErrorSeverity.MEDIUM,
            )


class AICommandSender:
    """Main AI command sender class for multi-provider communication."""

    def __init__(self):
        """Initialize the AI command sender."""
        self.settings = get_settings()
        self.error_handler = ErrorHandler()

        # Initialize providers
        self.providers = {}
        self._initialize_providers()

        # Request tracking
        self.request_history = []
        self.max_history_size = 1000

        # Performance tracking
        self.stats = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "average_response_time": 0.0,
            "total_response_time": 0.0,
            "provider_stats": {},
        }

        # Caching
        self.cache = {}
        self.cache_enabled = self.settings.ai.caching.get("enabled", True)
        self.cache_ttl = self.settings.ai.caching.get("ttl_seconds", 3600)

        logger.info("AI Command Sender initialized")

    def _initialize_providers(self):
        """Initialize AI providers from configuration."""
        for provider_name, config in self.settings.ai.providers.items():
            if config.get("enabled", False) and config.get("api_key"):
                try:
                    if provider_name == "openai":
                        self.providers[provider_name] = OpenAIProvider(config)
                    elif provider_name == "google":
                        self.providers[provider_name] = GoogleProvider(config)
                    # Add more providers as needed

                    logger.info(f"✅ Initialized {provider_name} provider")
                except Exception as e:
                    logger.error(
                        f"❌ Failed to initialize {provider_name} provider: {e}"
                    )
            else:
                logger.warning(
                    f"⚠️ Provider {provider_name} is disabled or missing API key"
                )

    async def send_command(
        self,
        command: str,
        provider: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Send a command to an AI provider and get response.

        Args:
            command: The command/prompt to send
            provider: Specific provider to use (optional)
            context: Additional context for the request

        Returns:
            Dictionary containing AI response and metadata
        """
        start_time = time.perf_counter()
        request_id = f"req_{int(time.time())}_{len(self.request_history)}"

        try:
            logger.info(f"Sending command to AI provider: {command[:100]}...")

            # Check cache first
            if self.cache_enabled:
                cache_key = self._generate_cache_key(command, provider, context)
                cached_response = self._get_cached_response(cache_key)
                if cached_response:
                    logger.info("✅ Using cached response")
                    return cached_response

            # Select provider
            selected_provider = self._select_provider(provider)
            if not selected_provider:
                raise BridgeError(
                    message="No available AI providers",
                    category=ErrorCategory.COMMUNICATION,
                    severity=ErrorSeverity.CRITICAL,
                )

            # Send request with retries
            response = await self._send_with_retries(
                selected_provider, command, context
            )

            # Calculate response time
            response_time = (time.perf_counter() - start_time) * 1000

            # Validate response
            validation_result = self._validate_response(response)

            # Calculate confidence score
            confidence = self._calculate_confidence(response, command)

            # Create result
            result = {
                "request_id": request_id,
                "success": True,
                "provider": selected_provider.name,
                "command": command,
                "response": response["content"],
                "confidence": confidence,
                "validation": validation_result,
                "response_time": response_time,
                "timestamp": time.time(),
                "usage": response.get("usage", {}),
                "cached": False,
            }

            # Cache response if enabled
            if self.cache_enabled:
                self._cache_response(cache_key, result)

            # Update statistics
            self._update_stats(response_time, True, selected_provider.name)

            # Add to history
            self._add_to_history(result)

            logger.info(
                f"✅ AI command processed successfully in {response_time:.2f}ms"
            )
            logger.info(
                f"Provider: {selected_provider.name}, Confidence: {confidence:.2f}"
            )

            return result

        except Exception as e:
            response_time = (time.perf_counter() - start_time) * 1000

            # Log error
            error_id = self.error_handler.log_error(
                e,
                context={
                    "command": command,
                    "provider": provider,
                    "response_time": response_time,
                },
                operation="send_command",
            )

            # Update statistics
            self._update_stats(response_time, False)

            error_result = {
                "request_id": request_id,
                "success": False,
                "error": str(e),
                "error_id": error_id,
                "command": command,
                "provider": provider or "unknown",
                "response_time": response_time,
                "timestamp": time.time(),
                "confidence": 0.0,
            }

            self._add_to_history(error_result)

            logger.error(f"❌ AI command failed: {e}")
            return error_result

    def _select_provider(
        self, preferred_provider: Optional[str] = None
    ) -> Optional[AIProvider]:
        """Select an AI provider for the request."""
        # Use preferred provider if specified and available
        if preferred_provider and preferred_provider in self.providers:
            return self.providers[preferred_provider]

        # Use default provider
        default_provider = self.settings.ai.default_provider
        if default_provider in self.providers:
            return self.providers[default_provider]

        # Use fallback provider
        fallback_provider = self.settings.ai.fallback_provider
        if fallback_provider in self.providers:
            return self.providers[fallback_provider]

        # Use any available provider
        for provider in self.providers.values():
            return provider

        return None

    async def _send_with_retries(
        self,
        provider: AIProvider,
        command: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Send request with retry logic."""
        last_exception = None

        for attempt in range(provider.retry_attempts):
            try:
                response = await provider.send_request(command, context)
                return response

            except Exception as e:
                last_exception = e
                logger.warning(f"Attempt {attempt + 1} failed: {e}")

                if attempt < provider.retry_attempts - 1:
                    # Exponential backoff
                    delay = 2**attempt
                    await asyncio.sleep(delay)

        # All retries failed
        raise last_exception or Exception("All retry attempts failed")

    def _validate_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Validate AI response for BASIC-M6502 compatibility."""
        content = response.get("content", "")

        validation = {"is_valid": True, "issues": [], "suggestions": []}

        # Check if content is empty
        if not content.strip():
            validation["is_valid"] = False
            validation["issues"].append("Empty response")
            return validation

        # Check for BASIC-M6502 keywords
        basic_keywords = [
            "PRINT",
            "LET",
            "FOR",
            "NEXT",
            "IF",
            "THEN",
            "GOTO",
            "END",
            "REM",
        ]
        content_upper = content.upper()

        has_basic_keywords = any(keyword in content_upper for keyword in basic_keywords)
        if not has_basic_keywords:
            validation["issues"].append("No BASIC-M6502 keywords found")
            validation["suggestions"].append(
                "Response may not contain valid BASIC commands"
            )

        # Check for line numbers
        import re

        line_numbers = re.findall(r"\d+\s+", content)
        if not line_numbers:
            validation["suggestions"].append(
                "Consider adding line numbers (10, 20, 30, etc.)"
            )

        # Check for proper syntax
        if "PRINT" in content_upper and '"' not in content:
            validation["suggestions"].append(
                "PRINT statements should include quotes around text"
            )

        return validation

    def _calculate_confidence(self, response: Dict[str, Any], command: str) -> float:
        """Calculate confidence score for the AI response."""
        content = response.get("content", "")

        if not content.strip():
            return 0.0

        confidence = 0.5  # Base confidence

        # Increase confidence for BASIC keywords
        basic_keywords = ["PRINT", "LET", "FOR", "NEXT", "IF", "THEN", "GOTO", "END"]
        content_upper = content.upper()

        keyword_count = sum(1 for keyword in basic_keywords if keyword in content_upper)
        confidence += min(keyword_count * 0.1, 0.3)

        # Increase confidence for proper line numbers
        import re

        line_numbers = re.findall(r"\d+\s+", content)
        if line_numbers:
            confidence += 0.1

        # Increase confidence for proper syntax
        if '"' in content and "PRINT" in content_upper:
            confidence += 0.1

        # Decrease confidence for common issues
        if "error" in content.lower() or "cannot" in content.lower():
            confidence -= 0.2

        return min(max(confidence, 0.0), 1.0)

    def _generate_cache_key(
        self, command: str, provider: Optional[str], context: Optional[Dict[str, Any]]
    ) -> str:
        """Generate cache key for request."""
        key_data = {"command": command, "provider": provider, "context": context or {}}
        key_string = json.dumps(key_data, sort_keys=True)
        return hashlib.md5(key_string.encode()).hexdigest()

    def _get_cached_response(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get cached response if available and not expired."""
        if cache_key not in self.cache:
            return None

        cached_data = self.cache[cache_key]
        if time.time() - cached_data["timestamp"] > self.cache_ttl:
            del self.cache[cache_key]
            return None

        # Return cached response with cached flag
        result = cached_data["response"].copy()
        result["cached"] = True
        return result

    def _cache_response(self, cache_key: str, response: Dict[str, Any]):
        """Cache the response."""
        self.cache[cache_key] = {"response": response, "timestamp": time.time()}

        # Trim cache if too large
        if len(self.cache) > self.settings.ai.caching.get("max_cache_size", 1000):
            # Remove oldest entries
            oldest_keys = sorted(
                self.cache.keys(), key=lambda k: self.cache[k]["timestamp"]
            )[:100]
            for key in oldest_keys:
                del self.cache[key]

    def _update_stats(
        self, response_time: float, success: bool, provider_name: str = "unknown"
    ):
        """Update performance statistics."""
        self.stats["total_requests"] += 1
        self.stats["total_response_time"] += response_time

        if success:
            self.stats["successful_requests"] += 1
        else:
            self.stats["failed_requests"] += 1

        # Update average response time
        self.stats["average_response_time"] = (
            self.stats["total_response_time"] / self.stats["total_requests"]
        )

        # Update provider-specific stats
        if provider_name not in self.stats["provider_stats"]:
            self.stats["provider_stats"][provider_name] = {
                "requests": 0,
                "successful": 0,
                "failed": 0,
                "average_time": 0.0,
            }

        provider_stats = self.stats["provider_stats"][provider_name]
        provider_stats["requests"] += 1
        if success:
            provider_stats["successful"] += 1
        else:
            provider_stats["failed"] += 1

        provider_stats["average_time"] = (
            provider_stats["average_time"] * (provider_stats["requests"] - 1)
            + response_time
        ) / provider_stats["requests"]

    def _add_to_history(self, result: Dict[str, Any]):
        """Add result to request history."""
        self.request_history.append(result)

        # Trim history if too large
        if len(self.request_history) > self.max_history_size:
            self.request_history = self.request_history[-self.max_history_size :]

    def get_statistics(self) -> Dict[str, Any]:
        """Get comprehensive statistics."""
        return {
            "stats": self.stats,
            "providers": list(self.providers.keys()),
            "cache_size": len(self.cache),
            "history_size": len(self.request_history),
            "cache_enabled": self.cache_enabled,
        }

    def get_recent_requests(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent request history."""
        return self.request_history[-limit:] if self.request_history else []

    def clear_cache(self):
        """Clear the response cache."""
        self.cache.clear()
        logger.info("AI command sender cache cleared")

    def clear_history(self):
        """Clear the request history."""
        self.request_history.clear()
        logger.info("AI command sender history cleared")

    def test_provider_connection(self, provider_name: str) -> Dict[str, Any]:
        """Test connection to a specific provider."""
        if provider_name not in self.providers:
            return {
                "success": False,
                "error": f"Provider {provider_name} not available",
            }

        provider = self.providers[provider_name]

        try:
            # Test with a simple command
            test_command = "Print hello world"
            result = asyncio.run(self.send_command(test_command, provider_name))

            return {
                "success": result["success"],
                "provider": provider_name,
                "test_response": result.get("response", ""),
                "response_time": result.get("response_time", 0),
                "error": result.get("error"),
            }

        except Exception as e:
            return {"success": False, "provider": provider_name, "error": str(e)}


if __name__ == "__main__":
    # Test the AI command sender
    sender = AICommandSender()

    print("AI Command Sender Test")
    print("=" * 50)

    # Test provider connections
    for provider_name in sender.providers.keys():
        print(f"\nTesting {provider_name} provider...")
        result = sender.test_provider_connection(provider_name)

        if result["success"]:
            print(f"✅ {provider_name} connection successful")
            print(f"   Response: {result['test_response'][:100]}...")
            print(f"   Response time: {result['response_time']:.2f}ms")
        else:
            print(f"❌ {provider_name} connection failed: {result['error']}")

    # Test command sending
    test_commands = [
        "Print hello world",
        "Set variable x to 42",
        "Create a loop from 1 to 5",
        "Calculate 10 plus 20",
    ]

    async def test_commands():
        print(f"\nTesting command processing...")
        for cmd in test_commands:
            print(f"\nCommand: {cmd}")
            result = await sender.send_command(cmd)

            if result["success"]:
                print(f"✅ Success (confidence: {result['confidence']:.2f})")
                print(f"   Response: {result['response']}")
            else:
                print(f"❌ Failed: {result['error']}")

    # Run async test
    asyncio.run(test_commands())

    # Show statistics
    stats = sender.get_statistics()
    print(f"\n📊 Statistics:")
    print(f"  Total requests: {stats['stats']['total_requests']}")
    print(f"  Successful: {stats['stats']['successful_requests']}")
    print(f"  Failed: {stats['stats']['failed_requests']}")
    print(f"  Average response time: {stats['stats']['average_response_time']:.2f}ms")
    print(f"  Available providers: {stats['providers']}")

    print("\n✅ AI Command Sender test completed!")
