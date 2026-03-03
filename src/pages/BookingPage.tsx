import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, CheckCircle, Upload, Plus, Minus, LogIn, ArrowLeft } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/contexts/AuthContext';

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number required"),
  tech_stack: z.array(z.string()).min(1, "Select at least one tech"),
  num_pages: z.number().min(1),
  website_copy: z.string().min(10, "Content is required"),
  extra_features: z.string().optional(),
  vision: z.string().optional(),
  target_audience: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const TECH_OPTIONS = ['React.js', 'Next.js', 'TypeScript', 'HTML & CSS'];

export const BookingPage = () => {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);
  const [submitted, setSubmitted] = React.useState(false);
  const [designRefs, setDesignRefs] = React.useState<string[]>([]);
  const [stepError, setStepError] = React.useState('');
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tech_stack: [],
      num_pages: 1,
      extra_features: '',
    }
  });

  // All hooks MUST be called unconditionally at the top level
  const numPages = useWatch({ control, name: 'num_pages' });
  const selectedTech = useWatch({ control, name: 'tech_stack' });

  const estimatedTotal = (numPages * 10);

  // Authentication effect
  React.useEffect(() => {
    if (!loading && !user) {
      // User is not authenticated, show login prompt
    }
  }, [user, loading]);

  const nextStep = async () => {
    setStepError('');
    let fieldsToValidate: any[] = [];
    
    if (step === 1) fieldsToValidate = ['name', 'email', 'phone', 'tech_stack'];
    else if (step === 2) fieldsToValidate = ['num_pages'];
    else if (step === 3) fieldsToValidate = ['website_copy'];
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(prev => Math.min(4, prev + 1));
    } else {
      setStepError('Please fill in required fields');
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!data) return;
    setServerError(null);
    
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      tech_stack: data.tech_stack,
      num_pages: data.num_pages,
      website_copy: data.website_copy,
      extra_features: data.extra_features || '',
      vision: data.vision || '',
      targetAudience: data.target_audience || '',
      design_refs: designRefs,
      estimated_total: (data.num_pages * 10),
      project_type: data.tech_stack.join(', ')
    };

    try {
      const res = await fetch('http://localhost:5000/api/mission-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmitted(true);
        setSuccessMsg('Success! Mission brief saved.');
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        setServerError('Failed to submit booking. Please try again.');
      }
    } catch (err) {
      setServerError('Server connection error. Please ensure backend is running.');
      console.error('Submit error:', err);
    }
  };

  const toggleTech = (tech: string) => {
    const current = selectedTech || [];
    if (current.includes(tech)) {
      setValue('tech_stack', current.filter(t => t !== tech));
    } else {
      setValue('tech_stack', [...current, tech]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const names = Array.from(files).map((f: File) => f.name);
      setDesignRefs(prev => [...prev, ...names]);
    }
  };

  // Conditional rendering AFTER all hooks
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/40 text-xs uppercase tracking-widest">Loading...</div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-4xl font-display font-black tracking-tighter mb-2">
              AUTHENTICATION REQUIRED
            </h1>
            <p className="text-white/40 text-sm uppercase tracking-widest">
              Please sign in with Google to access the Mission Brief form
            </p>
          </div>
          <button
            onClick={login}
            className="w-full px-8 py-4 bg-brand-accent text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white transition-colors"
          >
            <LogIn size={20} />
            Sign in with Google
          </button>
          <button
            onClick={() => navigate('/')}
            className="text-white/40 text-xs uppercase tracking-widest hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/40 text-xs uppercase tracking-widest">Loading...</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <CheckCircle size={80} className="text-brand-accent mx-auto mb-8" />
          <h1 className="text-5xl font-display font-black uppercase tracking-tighter mb-4">MISSION RECEIVED</h1>
          <p className="text-white/40 text-lg">Om Talokar will review your mission brief and contact you shortly.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6 mb-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/40 hover:text-white text-xs uppercase tracking-widest transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>
      </div>
      <div className="noise-overlay" />
      <div className="max-w-4xl mx-auto px-6">
        <header className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-brand-accent mb-6"
          >
            <div className="w-12 h-px bg-brand-accent" />
            Mission Brief // Phase_{step}
          </motion.div>
          <h2 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter">
            INITIATE <br /> <span className="text-outline">PROJECT</span>
          </h2>
        </header>

        <div className="command-card p-8 lg:p-12">
          <div className="flex justify-between items-center mb-16 overflow-x-auto pb-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-4 flex-shrink-0">
                <div className={cn(
                  "w-10 h-10 flex items-center justify-center text-[10px] font-bold border transition-all duration-500",
                  step >= s ? "bg-brand-accent border-brand-accent text-black" : "border-white/10 text-white/20"
                )}>
                  0{s}
                </div>
                {s < 4 && <div className="w-8 lg:w-16 h-px bg-white/5" />}
              </div>
            ))}
          </div>

          <motion.form
            layout
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-12"
          >
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">Identity_Name</label>
                      <input
                        {...register('name')}
                        className="w-full bg-black border border-white/5 p-5 focus:border-brand-accent outline-none transition-all text-lg font-light"
                        placeholder="E.g. Elon Musk"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">Identity_Email</label>
                      <input
                        {...register('email')}
                        className="w-full bg-black border border-white/5 p-5 focus:border-brand-accent outline-none transition-all text-lg font-light"
                        placeholder="elon@mars.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">Identity_Phone</label>
                    <input
                      {...register('phone')}
                      className="w-full bg-black border border-white/5 p-5 focus:border-brand-accent outline-none transition-all text-lg font-light"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="space-y-6">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">Tech_Stack_Selection</label>
                    <div className="flex flex-wrap gap-4">
                      {TECH_OPTIONS.map(tech => (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => toggleTech(tech)}
                          className={cn(
                            "px-6 py-3 border text-[10px] font-bold uppercase tracking-widest transition-all",
                            selectedTech?.includes(tech) ? "bg-brand-accent border-brand-accent text-black" : "border-white/10 text-white/40 hover:border-white/20"
                          )}
                        >
                          {tech}
                        </button>
                      ))}
                    </div>
                    {errors.tech_stack && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest">{errors.tech_stack.message}</p>}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12"
                >
                  <div className="space-y-6">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">Volume_Pages</label>
                    <div className="flex items-center gap-8">
                      <button 
                        type="button"
                        onClick={() => setValue('num_pages', Math.max(1, numPages - 1))}
                        className="w-16 h-16 border border-white/10 flex items-center justify-center hover:border-brand-accent transition-colors"
                      >
                        <Minus size={20} />
                      </button>
                      <span className="text-6xl font-display font-black">{numPages}</span>
                      <button 
                        type="button"
                        onClick={() => setValue('num_pages', numPages + 1)}
                        className="w-16 h-16 border border-white/10 flex items-center justify-center hover:border-brand-accent transition-colors"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="p-8 bg-brand-accent/5 border border-brand-accent/20">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20 mb-2">Estimated_Total</p>
                        <p className="text-5xl font-display font-black text-brand-accent">${estimatedTotal}</p>
                      </div>
                      <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Base: $10/Page</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  <div className="space-y-4">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">Design_Assets</label>
                    <div className="relative border-2 border-dashed border-white/10 p-12 text-center hover:border-brand-accent/40 transition-colors group">
                      <input 
                        type="file" 
                        multiple 
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                      <Upload size={32} className="mx-auto mb-4 text-white/20 group-hover:text-brand-accent transition-colors" />
                      <p className="text-xs text-white/40 uppercase tracking-widest">Drag & Drop Reference Images</p>
                    </div>
                    {designRefs.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-4">
                        {designRefs.map((name, i) => (
                          <div key={i} className="px-3 py-1 bg-white/5 border border-white/10 text-[8px] uppercase tracking-widest text-white/40">
                            {name}
                          </div>
                        ))}
                      </div>
                    )}
                    {stepError && (
                      <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-400">
                        {stepError}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">Website_Copy</label>
                    <textarea
                      {...register('website_copy')}
                      rows={5}
                      className="w-full bg-black border border-white/5 p-6 focus:border-brand-accent outline-none transition-all text-lg font-light resize-none"
                      placeholder="Paste your website text here..."
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">Special_Instructions</label>
                    <textarea
                      {...register('extra_features')}
                      rows={3}
                      className="w-full bg-black border border-white/5 p-6 focus:border-brand-accent outline-none transition-all text-lg font-light resize-none"
                      placeholder="Extra features, animations, specific requirements..."
                    />
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  {/* friendship building fields */}
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">Your Vision</label>
                      <textarea
                        {...register('vision')}
                        rows={4}
                        className="w-full bg-black border border-white/5 p-4 focus:border-brand-accent outline-none"
                        placeholder="Describe the dream version of this project"
                      />
                      {errors.vision && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest">{errors.vision.message}</p>}
                    </div>
                    <div className="space-y-4">
                      <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">Target Audience</label>
                      <textarea
                        {...register('target_audience')}
                        rows={3}
                        className="w-full bg-black border border-white/5 p-4 focus:border-brand-accent outline-none"
                        placeholder="Who are your customers?"
                      />
                      {errors.target_audience && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest">{errors.target_audience.message}</p>}
                    </div>
                  </div>
                </motion.div>
              )}
              {step !== 1 && step !== 2 && step !== 3 && step !== 4 && (
                <motion.div
                  key="fallback"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 text-center text-white/40"
                >
                  Loading...
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-4 pt-8 border-t border-white/5">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(prev => prev - 1)}
                  className="flex-1 py-6 border border-white/5 text-white/20 font-black uppercase tracking-[0.3em] text-[10px] hover:text-white transition-colors"
                >
                  [ Back ]
                </button>
              )}
              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-[2] py-6 bg-brand-accent text-black font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white transition-colors"
                >
                  Next_Phase
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] py-6 bg-brand-accent text-black font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'TRANSMITTING...' : 'INITIATE_MISSION'}
                </button>
              )}
            </div>
            {successMsg && (
              <div className="p-6 bg-green-500/10 border border-green-500/40 text-green-400 text-[10px] uppercase font-bold tracking-widest mt-8">
                {successMsg}
              </div>
            )}
            {serverError && (
              <div className="p-6 bg-red-500/10 border border-red-500/40 text-red-400 text-[10px] uppercase font-bold tracking-widest mt-8">
                {serverError}
              </div>
            )}
          </motion.form>
        </div>
      </div>
    </div>
  );
};
