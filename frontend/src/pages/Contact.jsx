import { motion } from 'framer-motion';
import { Globe, Phone, Mail } from 'lucide-react';

export default function Contact() {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    const athleteImageUrl = "https://static.wixstatic.com/media/f0e14c_f9ccb2795d604eeba0b18b5ad1885ee4~mv2.png/v1/crop/x_1007,y_0,w_4705,h_4480/fill/w_950,h_753,fp_0.50_0.50,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/NETRIN%20AAKASH%20pose%202%20(1)%20(1).png";

    return (
        <div id="contact" className="min-h-screen bg-background scroll-mt-24">
            {/* Header Banner */}
            <header className="bg-brand-500 h-48 md:h-64 flex items-center justify-center relative overflow-hidden">
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-white text-5xl md:text-7xl font-black tracking-[0.1em] z-10"
                >
                    Contact us
                </motion.h1>
                <div className="absolute inset-0 bg-black/5 mix-blend-overlay" />
            </header>

            <main className="container mx-auto py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 bg-white dark:bg-card shadow-2xl rounded-[40px] overflow-hidden border border-border">

                    {/* Left Side: Form */}
                    <motion.div {...fadeIn} className="p-8 md:p-12 lg:p-20 2xl:p-24 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-foreground/80">First name</label>
                                <input
                                    type="text"
                                    placeholder="First name"
                                    className="w-full bg-transparent border border-border rounded-2xl px-5 py-4 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all font-semibold"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-foreground/80">Last name</label>
                                <input
                                    type="text"
                                    placeholder="Last name"
                                    className="w-full bg-transparent border border-border rounded-2xl px-5 py-4 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all font-semibold"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-foreground/80 flex items-center gap-1">
                                    Email <span className="text-brand-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="w-full bg-transparent border border-border rounded-2xl px-5 py-4 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all font-semibold"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-foreground/80">Phone</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                        <Globe className="h-4 w-4 text-muted-foreground mr-2" />
                                        <span className="text-muted-foreground border-r border-border pr-2 mr-2">▼</span>
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="Phone"
                                        className="w-full bg-transparent border border-border rounded-2xl pl-28 pr-5 py-4 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all font-semibold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-foreground/80 flex items-center gap-1">
                                Message <span className="text-brand-500">*</span>
                            </label>
                            <textarea
                                placeholder="Message"
                                rows={6}
                                className="w-full bg-transparent border border-border rounded-2xl px-5 py-4 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all font-semibold resize-none"
                                required
                            />
                        </div>

                        <button className="bg-brand-500 hover:bg-brand-600 text-white font-black py-5 px-16 rounded-full transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-brand-500/25 text-lg tracking-widest">
                            Send message
                        </button>
                    </motion.div>

                    {/* Right Side: Image */}
                    <div className="relative min-h-[400px] lg:min-h-full overflow-hidden">
                        <motion.img
                            initial={{ scale: 1.1, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1 }}
                            src={athleteImageUrl}
                            alt="Athlete Performance"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-brand-900/10 pointer-events-none" />
                    </div>
                </div>
            </main>


        </div>
    );
}
