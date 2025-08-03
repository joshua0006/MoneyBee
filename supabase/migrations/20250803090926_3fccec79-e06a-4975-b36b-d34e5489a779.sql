-- Create storage bucket for receipt images
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true);

-- Create policies for receipt storage
CREATE POLICY "Anyone can view receipts" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'receipts');

CREATE POLICY "Anyone can upload receipts" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Anyone can update receipts" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'receipts');

CREATE POLICY "Anyone can delete receipts" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'receipts');