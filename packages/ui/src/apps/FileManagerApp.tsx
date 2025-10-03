import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Folder, 
  File, 
  ArrowLeft, 
  ArrowUp, 
  RefreshCw, 
  Search,
  MoreHorizontal,
  Download,
  Upload,
  Trash2,
  Copy,
  Move,
  Edit,
  Eye,
  Home,
  HardDrive,
  Image,
  FileText,
  Archive,
  Music,
  Video
} from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified: Date;
  permissions: string;
  icon: string;
  mimeType?: string;
}

interface FileManagerAppProps {
  onFileOpen?: (file: FileItem) => void;
  onFolderOpen?: (folder: FileItem) => void;
}

export const FileManagerApp: React.FC<FileManagerAppProps> = ({ 
  onFileOpen, 
  onFolderOpen 
}) => {
  const [currentPath, setCurrentPath] = useState('/home/user');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [loading, setLoading] = useState(false);

  // Mock file system data
  const mockFiles: FileItem[] = [
    {
      id: '1',
      name: 'Documents',
      type: 'folder',
      modified: new Date('2024-01-15'),
      permissions: 'drwxr-xr-x',
      icon: '📁',
      mimeType: 'inode/directory'
    },
    {
      id: '2',
      name: 'Downloads',
      type: 'folder',
      modified: new Date('2024-01-14'),
      permissions: 'drwxr-xr-x',
      icon: '📁',
      mimeType: 'inode/directory'
    },
    {
      id: '3',
      name: 'Pictures',
      type: 'folder',
      modified: new Date('2024-01-13'),
      permissions: 'drwxr-xr-x',
      icon: '📁',
      mimeType: 'inode/directory'
    },
    {
      id: '4',
      name: 'Projects',
      type: 'folder',
      modified: new Date('2024-01-12'),
      permissions: 'drwxr-xr-x',
      icon: '📁',
      mimeType: 'inode/directory'
    },
    {
      id: '5',
      name: 'README.md',
      type: 'file',
      size: 2456,
      modified: new Date('2024-01-11'),
      permissions: '-rw-r--r--',
      icon: '📄',
      mimeType: 'text/markdown'
    },
    {
      id: '6',
      name: 'config.json',
      type: 'file',
      size: 1234,
      modified: new Date('2024-01-10'),
      permissions: '-rw-r--r--',
      icon: '⚙️',
      mimeType: 'application/json'
    },
    {
      id: '7',
      name: 'notes.txt',
      type: 'file',
      size: 856,
      modified: new Date('2024-01-09'),
      permissions: '-rw-r--r--',
      icon: '📝',
      mimeType: 'text/plain'
    },
    {
      id: '8',
      name: 'screenshot.png',
      type: 'file',
      size: 245678,
      modified: new Date('2024-01-08'),
      permissions: '-rw-r--r--',
      icon: '🖼️',
      mimeType: 'image/png'
    }
  ];

  useEffect(() => {
    loadFiles();
  }, [currentPath]);

  const loadFiles = async () => {
    setLoading(true);
    // Simulate MCP filesystem call
    setTimeout(() => {
      setFiles(mockFiles);
      setLoading(false);
    }, 500);
  };

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentPath(`${currentPath}/${file.name}`);
      if (onFolderOpen) onFolderOpen(file);
    } else {
      if (onFileOpen) onFileOpen(file);
    }
  };

  const handleBack = () => {
    const parts = currentPath.split('/');
    if (parts.length > 1) {
      parts.pop();
      setCurrentPath(parts.join('/') || '/');
    }
  };

  const handleUp = () => {
    const parts = currentPath.split('/');
    if (parts.length > 1) {
      parts.pop();
      setCurrentPath(parts.join('/') || '/');
    }
  };

  const handleRefresh = () => {
    loadFiles();
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(file => file.id));
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '—';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') return <Folder className="h-4 w-4" />;
    
    switch (file.mimeType?.split('/')[0]) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  const quickAccessItems = [
    { name: 'Home', path: '/home/user', icon: <Home className="h-4 w-4" /> },
    { name: 'Documents', path: '/home/user/Documents', icon: <FileText className="h-4 w-4" /> },
    { name: 'Downloads', path: '/home/user/Downloads', icon: <Download className="h-4 w-4" /> },
    { name: 'Pictures', path: '/home/user/Pictures', icon: <Image className="h-4 w-4" /> },
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            disabled={currentPath === '/'}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUp}
            disabled={currentPath === '/'}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-border p-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickAccessItems.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setCurrentPath(item.path)}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Used</span>
                  <span>125 GB</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <div className="text-xs text-muted-foreground">
                  125 GB of 512 GB used
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">
                    {currentPath}
                  </CardTitle>
                  <CardDescription>
                    {filteredFiles.length} items
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedFiles.length > 0 && (
                    <Badge variant="secondary">
                      {selectedFiles.length} selected
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSelectAll}
                        className="h-8 w-8 p-0"
                      >
                        {selectedFiles.length === files.length ? '☑' : '☐'}
                      </Button>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Modified</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => (
                    <TableRow
                      key={file.id}
                      className={`cursor-pointer hover:bg-accent/50 ${
                        selectedFiles.includes(file.id) ? 'bg-accent' : ''
                      }`}
                      onClick={() => handleFileSelect(file.id)}
                      onDoubleClick={() => handleFileClick(file)}
                    >
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          {selectedFiles.includes(file.id) ? '☑' : '☐'}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getFileIcon(file)}
                          <span className="font-medium">{file.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatFileSize(file.size)}</TableCell>
                      <TableCell>{file.modified.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {file.type === 'folder' ? 'Folder' : 'File'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleFileClick(file)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Move className="h-4 w-4 mr-2" />
                              Move
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};