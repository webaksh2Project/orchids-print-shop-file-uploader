'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { Download, Trash2, LogOut, FileText, Printer, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { connectSocket } from '@/lib/socket-client';
import { toast } from 'sonner';

interface FileData {
  id: string;
  customerName: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  mimeType: string;
}

interface User {
  id: string;
  email: string;
  shopName: string;
  shopId: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    fetchUser();
    fetchFiles();

    // Auto refresh every 3 seconds
    const interval = setInterval(fetchFiles, 3000);

    const socket = connectSocket();
    socketRef.current = socket;

    return () => {
      clearInterval(interval);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (user?.shopId && socketRef.current) {
      socketRef.current.emit('join-shop', user.shopId);

      socketRef.current.on('file-uploaded', (fileData: FileData) => {
        setFiles((prev) => [fileData, ...prev]);
        toast.success(`New file received from ${fileData.customerName}`, {
          description: fileData.fileName,
        });
        router.refresh();
      });
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setUser(data.user);

      const uploadUrl = `${window.location.origin}/upload/${data.user.shopId}`;
      const qrCode = await QRCode.toDataURL(uploadUrl, {
        width: 300,
        margin: 2,
        color: { dark: '#7c3aed', light: '#ffffff' },
      });
      setQrCodeUrl(qrCode);
    } catch (error) {
      console.error('Error fetching user:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files');
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handlePrint = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
      }
    } catch (error) {
      console.error('Error printing file:', error);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const toggleExpand = (id: string) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              {user?.shopName}
            </h1>
            <p className="text-slate-400 mt-1">{user?.email}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-purple-500/50 text-purple-300 hover:bg-purple-950"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-purple-300">Customer QR Code</CardTitle>
              <CardDescription className="text-slate-400">
                Display this QR code in your shop for customers to scan
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {qrCodeUrl && (
                <div className="bg-white p-4 rounded-lg">
                  <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                </div>
              )}
              <p className="text-sm text-slate-400 mt-4 text-center">
                Shop ID: <span className="font-mono text-purple-300">{user?.shopId}</span>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-purple-300">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-950/30 rounded-lg">
                <span className="text-slate-300">Total Files</span>
                <span className="text-2xl font-bold text-purple-400">{files.length}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-950/30 rounded-lg">
                <span className="text-slate-300">Total Size</span>
                <span className="text-2xl font-bold text-purple-400">
                  {formatFileSize(files.reduce((acc, f) => acc + f.fileSize, 0))}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-purple-300">Received Files</CardTitle>
            <CardDescription className="text-slate-400">
              Files uploaded by customers (auto-deletes after 24 hours)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {files.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No files received yet. Share your QR code with customers!
              </div>
            ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex flex-col p-4 bg-slate-900/50 rounded-lg border border-purple-500/10 hover:border-purple-500/30 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex items-center gap-4 flex-1 cursor-pointer group"
                          onClick={() => toggleExpand(file.id)}
                        >
                          <div className="bg-purple-900/50 p-2 rounded-lg group-hover:bg-purple-800/50 transition-colors">
                            <FileText className="h-6 w-6 text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-lg text-white group-hover:text-purple-300 transition-colors">
                                {file.customerName}
                              </p>
                              {expandedFiles.has(file.id) ? (
                                <ChevronUp className="h-4 w-4 text-slate-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-slate-500" />
                              )}
                            </div>
                            <p className="text-xs text-slate-400">
                              {formatFileSize(file.fileSize)} • {formatDate(file.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePrint(file.id)}
                            className="border-green-500/50 text-green-300 hover:bg-green-950"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(file.id, file.fileName)}
                            className="border-blue-500/50 text-blue-300 hover:bg-blue-950"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(file.id)}
                            className="border-red-500/50 text-red-300 hover:bg-red-950"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {expandedFiles.has(file.id) && (
                        <div className="mt-4 pt-4 border-t border-purple-500/10 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="flex items-center gap-2 text-purple-300">
                            <span className="text-sm font-medium">File Name:</span>
                            <span className="text-sm break-all font-mono">{file.fileName}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
