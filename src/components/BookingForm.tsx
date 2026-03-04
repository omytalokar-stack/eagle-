import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'motion/react';
import { Send } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  service: z.string().min(1, "Please select a service"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof formSchema>;

export const BookingForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch(`${API_BASE}/api/mission-brief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        // if server responded but with error status
        const text = await res.text();
        console.error('Submission error', text);
        alert('Server error: ' + res.status);
      } else {
        alert('Thank you! I will get back to you soon.');
        reset();
      }
    } catch (err) {
      console.error('Connection error', err);
      alert('Server Connection Error');
    }
  };

  return (
    <section id="contact" className="py-24 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          <div>
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">03. Contact</h2>
            <h3 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-8">
              LET'S BUILD <br />
              <span className="text-brand-accent">SOMETHING</span> <br />
              GREAT.
            </h3>
            <p className="text-zinc-400 text-lg mb-12 max-w-md">
              Have a project in mind? Fill out the form or send me an email directly at <a href="mailto:hello@dashing.ui" className="text-white underline underline-offset-4 hover:text-brand-accent transition-colors">hello@dashing.ui</a>
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
                <span className="text-sm font-mono uppercase tracking-widest">Available for new projects</span>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-900 p-8 md:p-12 border border-zinc-800"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Name</label>
                  <input
                    {...register('name')}
                    className="w-full bg-transparent border-b border-zinc-700 py-3 focus:border-brand-accent outline-none transition-colors"
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Email</label>
                  <input
                    {...register('email')}
                    className="w-full bg-transparent border-b border-zinc-700 py-3 focus:border-brand-accent outline-none transition-colors"
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Service</label>
                <select
                  {...register('service')}
                  className="w-full bg-transparent border-b border-zinc-700 py-3 focus:border-brand-accent outline-none transition-colors appearance-none"
                >
                  <option value="" className="bg-zinc-900">Select a service</option>
                  <option value="ui-dev" className="bg-zinc-900">UI Development</option>
                  <option value="react-app" className="bg-zinc-900">React Application</option>
                  <option value="consulting" className="bg-zinc-900">Technical Consulting</option>
                </select>
                {errors.service && <p className="text-red-500 text-xs">{errors.service.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Message</label>
                <textarea
                  {...register('message')}
                  rows={4}
                  className="w-full bg-transparent border-b border-zinc-700 py-3 focus:border-brand-accent outline-none transition-colors resize-none"
                  placeholder="Tell me about your project..."
                />
                {errors.message && <p className="text-red-500 text-xs">{errors.message.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-accent text-black py-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : (
                  <>
                    Send Message <Send size={16} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
