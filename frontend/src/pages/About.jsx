import { motion } from "framer-motion";
import { Activity, Heart, Zap, Brain, ClipboardCheck, Target, ShieldCheck, Microscope } from "lucide-react";

export default function About() {
    const fadeIn = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.8, ease: "easeOut" }
    };

    const approachItems = [
        {
            icon: Heart,
            title: "Internal Load",
            desc: "Quantifying the cardiovascular stress encountered during varied training intensities."
        },
        {
            icon: Brain,
            title: "ANS Responses",
            desc: "Monitoring the autonomic nervous system to measure recovery and readiness."
        },
        {
            icon: Target,
            title: "Intensity Metrics",
            desc: "Precise distribution analysis across personalized physiological zones."
        },
        {
            icon: Microscope,
            title: "Validated Science",
            desc: "Built on rigorous exercise physiology and biomedical engineering principles."
        }
    ];

    return (
        <div className="bg-background text-foreground overflow-x-hidden pt-20 selection:bg-brand-100 selection:text-brand-900">

            {/* Section 1: Hero - Orange 300 BG */}
            <section className="relative min-h-[90vh] flex items-center py-20 px-4 sm:px-6 lg:px-8 bg-orange-400 dark:bg-orange-900/40 transition-colors duration-500">
                <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div {...fadeIn} className="max-w-2xl 3xl:max-w-4xl">
                        <h1 className="text-5xl md:text-7xl 3xl:text-8xl font-black tracking-tighter mb-8">
                            About <span className="text-brand-500">us</span>
                        </h1>
                        <p className="text-lg 3xl:text-2xl text-foreground/90 leading-relaxed mb-6 font-medium">
                            We are a science-driven performance analytics platform dedicated to quantifying cardiac load and physiological stress in athletes and physically active individuals.
                        </p>
                        <p className="text-lg 3xl:text-2xl text-foreground/90 leading-relaxed mb-10 font-medium">
                            Our mission is to bridge the gap between raw biosignals and actionable performance insights by transforming cardiovascular data into reliable, interpretable, and training-relevant metrics.
                        </p>
                        <button className="px-10 py-4 bg-brand-500 text-white font-black tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-transform active:scale-95 shadow-brand-500/20">
                            Explore our products
                        </button>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="relative rounded-[40px] overflow-hidden shadow-2xl aspect-[4/5] lg:aspect-auto h-full lg:min-h-[600px]"
                    >
                        <img
                            src="https://static.wixstatic.com/media/f0e14c_f4139a96ea67447fb89a158d0949b3fe~mv2.jpg/v1/fill/w_894,h_690,fp_0.50_0.43,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/image%2010.jpg"
                            alt="Performance Swimmer"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-brand-900/10 mix-blend-multiply" />
                    </motion.div>
                </div>
            </section>

            {/* Section 2: Rooted in Physiology - Neutral BG */}
            <section className="py-24 bg-background border-y border-border px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1 relative h-full min-h-[400px]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.2, borderRadius: "100px" }}
                            whileInView={{ opacity: 1, scale: 1, borderRadius: "40px" }}
                            viewport={{ margin: "-100px" }}
                            transition={{ duration: 0.8, ease: "backOut" }}
                            className="w-full h-full overflow-hidden shadow-2xl"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=80"
                                alt="Soccer Analytics"
                                className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-brand-600/20 to-transparent pointer-events-none" />
                        </motion.div>
                    </div>
                    <motion.div {...fadeIn} className="order-1 lg:order-2 space-y-6">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                            Where physiology<br />
                            <span className="text-brand-500">guides performance</span>
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Built at the intersection of exercise physiology, biomedical engineering, and sports science, our platform delivers objective monitoring of training load, recovery, and cardiovascular strain using validated signal-processing and modeling approaches.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Section 3: Our Vision - Orange 300 BG */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 text-center bg-orange-400 dark:bg-orange-900/40 relative overflow-hidden transition-colors duration-500 border-b border-border">
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #c2410c 1px, transparent 0)', backgroundSize: '40px 40px' }} />

                <div className="container max-w-4xl 3xl:max-w-6xl mx-auto relative z-10">
                    <motion.div
                        {...fadeIn}
                        className="relative rounded-[48px] p-12 md:p-20 border border-orange-400/50 dark:border-orange-800/50 shadow-2xl overflow-hidden group bg-white/20 dark:bg-black/20 backdrop-blur-xl"
                    >
                        {/* Inner Background Image */}
                        <div className="absolute inset-0 z-0">
                            <img
                                src="https://static.wixstatic.com/media/f0e14c_ac3f55f64ab1454e8df0972c69281a60~mv2.png/v1/crop/x_38,y_1,w_1141,h_1156/fill/w_784,h_661,fp_0.50_0.50,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/Beige%20and%20Grey%20Minimalist%20Woman%20Fashion%20Model%20Photo%20Collage%20LinkedIn%20Post.png"
                                alt="Vision Background"
                                className="w-full h-full object-cover opacity-20 transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-orange-300/10 dark:bg-orange-900/20" />
                        </div>

                        {/* Content Overlay */}
                        <div className="relative z-10">
                            <h2 className="text-orange-950 dark:text-orange-100 text-base font-black tracking-[0.3em] mb-10">Our vision</h2>
                            <p className="text-orange-950 dark:text-white text-3xl md:text-5xl font-black tracking-tight leading-tight mb-8">
                                The gold-standard physiological ecosystem for high performance.
                            </p>
                            <p className="text-orange-900/80 dark:text-orange-100/80 text-lg leading-relaxed font-medium">
                                Empowering athletes, coaches, clinicians, and researchers to make data-informed decisions for performance optimization, injury risk reduction, and long-term cardiovascular health.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Section 4: What We Do - Full Content Migration */}
            <section className="bg-background">
                {/* Intro Part - Neutral BG */}
                <div className="py-24 px-4 sm:px-6 lg:px-8 border-b border-border">
                    <div className="container mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-baseline">
                            <motion.div {...fadeIn}>
                                <h2 className="text-2xl font-black tracking-[0.3em] text-brand-500 mb-6">What we do</h2>
                                <h3 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                                    Transforming cardiac data into actionable insights
                                </h3>
                            </motion.div>
                            <motion.div {...fadeIn} className="space-y-6">
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    From raw cardiac signals to clear coaching intelligence, we analyze beat-to-beat heart data, ECG signals, and heart rhythm responses to show how the body truly responds to training stress, fatigue, and recovery.
                                </p>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Instead of relying on surface-level metrics, we combine cardiac load, HRV, movement, and recovery data into one clean dashboard delivering a complete picture of internal training load and physiological adaptation.
                                </p>
                            </motion.div>
                        </div>

                        {/* Process Grid: Capture, Analyze, Deliver */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: "Capture",
                                    icon: Activity,
                                    desc: "Lightweight, chest-worn ECG sensors collect precise heart data during running, gym sessions, and team sports without signal loss."
                                },
                                {
                                    title: "Analyze",
                                    icon: Microscope,
                                    desc: "Advanced algorithms decode every heartbeat to quantify cardiac load, stress, fatigue, and recovery in real time."
                                },
                                {
                                    title: "Deliver",
                                    icon: ClipboardCheck,
                                    desc: "Clear insights are delivered as session summaries, readiness indicators, recovery guidance, and long-term performance trends."
                                }
                            ].map((item, idx) => (
                                <motion.div
                                    key={item.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group p-10 rounded-[32px] border border-border bg-card/50 hover:bg-brand-500 transition-all duration-500"
                                >
                                    <div className="h-16 w-16 rounded-2xl bg-brand-500 text-white flex items-center justify-center mb-8 group-hover:bg-white group-hover:text-brand-500 shadow-xl shadow-brand-500/10 transition-colors">
                                        <item.icon className="h-8 w-8" />
                                    </div>
                                    <h4 className="text-2xl font-black mb-4 group-hover:text-white transition-colors">{item.title}</h4>
                                    <p className="text-muted-foreground leading-relaxed group-hover:text-white/80 transition-colors">
                                        {item.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Alternate Sliding Part: Tools - Orange 300 BG */}
                <div className="py-32 px-4 sm:px-6 lg:px-8 bg-orange-400 dark:bg-orange-900/40 border-b border-border relative overflow-hidden">
                    {/* Decorative Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #c2410c 1px, transparent 0)', backgroundSize: '60px 60px' }} />

                    <div className="container mx-auto relative z-10">
                        <div className="space-y-16">
                            <div className="text-center">
                                <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-orange-950 dark:text-white">
                                    Tools for <span className="text-brand-600 dark:text-brand-400">Individualized</span> Performance Management
                                </h2>
                            </div>

                            <div className="relative">
                                <div className="flex flex-col lg:flex-row gap-8">
                                    {[
                                        {
                                            id: "load",
                                            title: "1. Training Load & Internal Stress",
                                            desc: "Understand how hard your cardiovascular system is working during every session. Netrin measures internal load, cardiac strain, and adaptation to support smarter progression and safer training.",
                                            impact: "Optimal training periodization, prevent overtraining, and build consistent progress.",
                                            image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=80"
                                        },
                                        {
                                            id: "recovery",
                                            title: "2. Recovery & Readiness",
                                            desc: "Daily readiness insights reveal how prepared the body is to train. By tracking recovery trends and cardiac balance, Netrin helps identify when to push, sustain, or recover.",
                                            impact: "Identify optimal training windows and prevent non-functional overreaching.",
                                            image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80"
                                        },
                                        {
                                            id: "energy",
                                            title: "3. Energy Expenditure",
                                            desc: "See how much energy the body uses at rest, during training, and across the day. These insights support fueling, recovery, and fatigue management with greater precision.",
                                            impact: "Guide fueling, recovery, and rehabilitation with scientific accuracy.",
                                            image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80"
                                        }
                                    ].map((tool, idx) => (
                                        <motion.div
                                            key={tool.id}
                                            initial={{ opacity: 0, x: 50 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.2, duration: 0.8 }}
                                            className="flex-1 bg-card/80 backdrop-blur-sm border border-brand-100 dark:border-brand-900 rounded-[40px] overflow-hidden shadow-xl"
                                        >
                                            <div className="h-64 relative overflow-hidden">
                                                <img src={tool.image} alt={tool.title} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                                            </div>
                                            <div className="p-10 space-y-6">
                                                <h4 className="text-2xl font-black">{tool.title}</h4>
                                                <p className="text-muted-foreground leading-relaxed">{tool.desc}</p>
                                                <div className="pt-6 border-t border-border">
                                                    <p className="text-xs font-black tracking-widest text-brand-500 mb-2">Why it matters</p>
                                                    <p className="font-bold">{tool.impact}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 5: Metrics We Measure - Refined 2x2 Grid */}
            <section className="py-32 px-4 sm:px-6 lg:px-8 bg-background border-t border-border relative overflow-hidden transition-colors duration-500">
                {/* Subtle Grid Pattern Overlay - Theme Aware */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }} />

                <div className="container mx-auto relative z-10">
                    <motion.div {...fadeIn} className="text-center mb-24">
                        <h3 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                            Metrics we <span className="text-brand-500 underline underline-offset-8 decoration-4">measure</span>
                        </h3>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-32">
                        {[
                            {
                                category: "Intensity",
                                metrics: [
                                    { name: "Minimum HR (bpm)", icon: Heart },
                                    { name: "Avg HR (bpm)", icon: Activity },
                                    { name: "Maximum HR (bpm)", icon: Zap }
                                ]
                            },
                            {
                                category: "Physiological load",
                                metrics: [
                                    { name: "Training load", icon: Target },
                                    { name: "Acute load", icon: Brain },
                                    { name: "Chronic load", icon: ShieldCheck },
                                    { name: "ACWR", icon: Microscope },
                                    { name: "Movement load", icon: Activity }
                                ]
                            },
                            {
                                category: "Recovery",
                                metrics: [
                                    { name: "RMSSD", icon: Heart },
                                    { name: "Resting HR (bpm)", icon: Activity }
                                ]
                            },
                            {
                                category: "Time series data",
                                metrics: [
                                    { name: "Training Load", icon: Target },
                                    { name: "Energy expenditure", icon: Zap }
                                ]
                            }
                        ].map((cat) => (
                            <div key={cat.category} className="space-y-12">
                                <motion.h3
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="text-4xl md:text-5xl font-black text-center tracking-tight"
                                >
                                    {cat.category}
                                </motion.h3>

                                <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                                    {cat.metrics.map((metric, mIdx) => (
                                        <motion.div
                                            key={metric.name}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: mIdx * 0.1, duration: 0.5 }}
                                            className="flex flex-col items-center group w-32 md:w-36"
                                        >
                                            <div className="relative mb-4">
                                                {/* Glowing Halo Effect - Dynamic Color */}
                                                <div className="absolute inset-0 bg-brand-500/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                                {/* Icon Box - Theme Aware */}
                                                <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-[28px] border border-border bg-card/50 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:border-brand-500/40 group-hover:bg-brand-500/10 transition-all duration-500">
                                                    <metric.icon className="h-10 w-10 md:h-12 md:w-12 text-foreground/80 group-hover:text-brand-500 group-hover:scale-110 transition-all duration-500" strokeWidth={1.5} />
                                                </div>
                                            </div>
                                            <span className="text-muted-foreground text-[10px] md:text-sm font-black tracking-widest text-center group-hover:text-foreground transition-colors duration-300">
                                                {metric.name}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
