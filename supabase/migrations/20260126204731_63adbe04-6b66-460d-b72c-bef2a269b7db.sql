-- Create settings table for storing shop configuration
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'shop_settings',
  maintenance_mode BOOLEAN DEFAULT false,
  maintenance_message TEXT DEFAULT 'Der Shop ist derzeit in Wartung. Bitte versuchen Sie es später erneut.',
  announce_bar_enabled BOOLEAN DEFAULT false,
  announce_bar_message TEXT DEFAULT '',
  announce_bar_link TEXT DEFAULT '',
  free_shipping_threshold DECIMAL(10,2) DEFAULT 50.00,
  standard_shipping_cost DECIMAL(10,2) DEFAULT 4.99,
  express_shipping_cost DECIMAL(10,2) DEFAULT 2.99,
  allow_guest_checkout BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  order_alerts BOOLEAN DEFAULT true,
  low_stock_alerts BOOLEAN DEFAULT true,
  low_stock_threshold INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow admins to read/write settings
CREATE POLICY "Admins can manage settings" ON public.settings
  FOR ALL
  USING (public.has_admin_access(auth.uid()))
  WITH CHECK (public.has_admin_access(auth.uid()));

-- Allow public read for certain settings (maintenance mode, announce bar)
CREATE POLICY "Public can read public settings" ON public.settings
  FOR SELECT
  USING (true);

-- Insert default settings row
INSERT INTO public.settings (id) VALUES ('shop_settings') ON CONFLICT (id) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();