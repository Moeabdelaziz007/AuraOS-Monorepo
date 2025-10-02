10 REM AI Vintage OS - Performance Test
20 REM Tests performance with many operations
30 PRINT "=== PERFORMANCE TEST ==="
40 PRINT "Testing rapid operations..."
50 FOR I = 1 TO 100
60 LET X = I * 2
70 LET Y = X + 1
80 LET Z = Y * 3
90 IF I MOD 10 = 0 THEN PRINT "Progress: "; I
100 NEXT I
110 PRINT "Testing string operations..."
120 FOR J = 1 TO 50
130 PRINT "String test "; J
140 NEXT J
150 PRINT "Performance test completed!"
160 END
