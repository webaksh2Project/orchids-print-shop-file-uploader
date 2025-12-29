'use client';

import { useState, use } from 'react';
import { Upload, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UploadPage({ params }: { params: Promise<{ shopId: string }> }) {
  const { shopId } = use(params);
  const [customerName, setCustomerName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus('idle');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName || !file) {
      setErrorMessage('Please enter your name and select a file');
      setUploadStatus('error');
      return;
    }

    setUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('shopId', shopId);
      formData.append('customerName', customerName);
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadStatus('success');
      setCustomerName('');
      setFile(null);
      
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setUploadStatus('error');
      setErrorMessage(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-blue-500/20">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-blue-950/50 rounded-full">
              <Upload className="h-12 w-12 text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent">
            Upload Your File
          </CardTitle>
          <CardDescription className="text-center text-slate-400">
            Send your document to the print shop
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploadStatus === 'success' ? (
            <div className="text-center py-8 space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-20 w-20 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-400">Upload Successful!</h3>
                <p className="text-slate-400 mt-2">
                  Your file has been sent to the shop. Please proceed to the counter.
                </p>
              </div>
              <Button
                onClick={() => setUploadStatus('idle')}
                className="mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                Upload Another File
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Your Name</Label>
                <Input
                  id="customerName"
                  placeholder="Enter your name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="file">Select File</Label>
                <div className="relative">
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    required
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                    className="bg-slate-800 border-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-950 file:text-blue-300 hover:file:bg-blue-900"
                  />
                </div>
                {file && (
                  <p className="text-sm text-slate-400 mt-2">
                    Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  Accepted: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, TXT (Max 10MB)
                </p>
              </div>

              {uploadStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/50 p-3 rounded border border-red-800">
                  <XCircle className="h-5 w-5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <span className="animate-pulse">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Send File
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-700">
            <div className="space-y-2 text-sm text-slate-400">
              <p className="font-semibold text-slate-300">Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Enter your name</li>
                <li>Select the file you want to print</li>
                <li>Click "Send File"</li>
                <li>Wait for confirmation</li>
                <li>Proceed to the counter to collect your print</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
