import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pt-24 pb-16">
                {children}
            </main>
            <Footer />
        </div>
    );
}
