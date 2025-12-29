import Link from 'next/link';
import { QrCode, Upload, Shield, Zap, CheckCircle2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
              PrintShare
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
              Seamless File Sharing for Print Shops & Cybercafes
            </p>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Real-time file delivery with QR codes. No login required for customers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-950 text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-950/50 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="h-6 w-6 text-purple-400" />
              </div>
              <CardTitle className="text-purple-300">QR Code Upload</CardTitle>
              <CardDescription className="text-slate-400">
                Customers scan and upload files instantly - no apps or accounts needed
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-950/50 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-purple-400" />
              </div>
              <CardTitle className="text-purple-300">Real-Time Delivery</CardTitle>
              <CardDescription className="text-slate-400">
                Files appear on your dashboard instantly via WebSocket technology
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-950/50 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-400" />
              </div>
              <CardTitle className="text-purple-300">Secure & Private</CardTitle>
              <CardDescription className="text-slate-400">
                Files auto-delete after 24 hours. Rate limiting prevents abuse.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-purple-300">For Shop Owners</h3>
              <div className="space-y-4">
                {[
                  { icon: CheckCircle2, text: 'Create your account in 30 seconds' },
                  { icon: QrCode, text: 'Generate your unique QR code' },
                  { icon: FileText, text: 'Display QR code in your shop' },
                  { icon: Zap, text: 'Receive files instantly on dashboard' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-950/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <item.icon className="h-5 w-5 text-purple-400" />
                    </div>
                    <p className="text-slate-300 text-lg">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-cyan-300">For Customers</h3>
              <div className="space-y-4">
                {[
                  { icon: QrCode, text: 'Scan the shop QR code' },
                  { icon: Upload, text: 'Enter your name' },
                  { icon: FileText, text: 'Select your file (PDF, DOC, JPG, etc.)' },
                  { icon: CheckCircle2, text: 'Click send - done!' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-cyan-950/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <item.icon className="h-5 w-5 text-cyan-400" />
                    </div>
                    <p className="text-slate-300 text-lg">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center">
          <Card className="bg-slate-800/50 border-purple-500/20 max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold text-purple-300 mb-4">
                Ready to streamline your print shop?
              </h3>
              <p className="text-slate-400 mb-6">
                Join hundreds of print shops using PrintShare for hassle-free file transfers
              </p>
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Create Free Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <footer className="mt-20 text-center text-slate-500 text-sm">
          <p>© 2024 PrintShare. Built for print shops and cybercafes.</p>
        </footer>
      </div>
    </div>
  );
}
