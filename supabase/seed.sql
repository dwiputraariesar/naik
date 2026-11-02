-- ==============================================================================
-- PROJECT NAIK (Summittact) - PHASE 1E: SEEDING MASTER DATA (FINAL APPROVED)
-- 7 Mountains & 10 Basecamps di Pulau Jawa
-- POLA: SEQUENTIAL / IDEMPOTENT MENGGUNAKAN WHERE NOT EXISTS (AKURASI > KELENGKAPAN)
-- ==============================================================================

-- 0. Penyesuaian Schema: Drop NOT NULL pada kolom tarif & parkir agar benar-benar NULLABLE
ALTER TABLE public.basecamps ALTER COLUMN ticket_fee DROP NOT NULL;
ALTER TABLE public.basecamps ALTER COLUMN parking_motorcycle DROP NOT NULL;
ALTER TABLE public.basecamps ALTER COLUMN parking_car DROP NOT NULL;

-- 1. Insert Master Data: Mountains (7 Gunung)
INSERT INTO public.mountains (name, island, province, elevation, difficulty, description, estimated_duration)
SELECT 'Semeru', 'Jawa', 'Jawa Timur', 3676, 'sulit', 'Gunung tertinggi di Pulau Jawa dengan karakter pendakian yang menantang dan kawasan Ranu Kumbolo.', '2-3 hari'
WHERE NOT EXISTS (SELECT 1 FROM public.mountains WHERE name = 'Semeru');

INSERT INTO public.mountains (name, island, province, elevation, difficulty, description, estimated_duration)
SELECT 'Merbabu', 'Jawa', 'Jawa Tengah', 3145, 'sedang', 'Gunung stratovolcano yang terkenal dengan pemandangan padang sabana terbuka dan panorama Gunung Merapi.', '6-8 jam'
WHERE NOT EXISTS (SELECT 1 FROM public.mountains WHERE name = 'Merbabu');

INSERT INTO public.mountains (name, island, province, elevation, difficulty, description, estimated_duration)
SELECT 'Prau', 'Jawa', 'Jawa Tengah', 2590, 'mudah', 'Gunung berketinggian sedang di Dataran Tinggi Dieng yang populer untuk pendakian singkat dan panorama matahari terbit.', '3-4 jam'
WHERE NOT EXISTS (SELECT 1 FROM public.mountains WHERE name = 'Prau');

INSERT INTO public.mountains (name, island, province, elevation, difficulty, description, estimated_duration)
SELECT 'Gede', 'Jawa', 'Jawa Barat', 2958, 'sedang', 'Kawasan konservasi berhutan pegunungan lebat dengan padang edelweis Alun-alun Surya Kencana.', '5-7 jam'
WHERE NOT EXISTS (SELECT 1 FROM public.mountains WHERE name = 'Gede');

INSERT INTO public.mountains (name, island, province, elevation, difficulty, description, estimated_duration)
SELECT 'Lawu', 'Jawa', 'Jawa Tengah', 3265, 'sedang', 'Gunung di kawasan perbatasan Jawa Tengah dan Jawa Timur yang dikenal dengan peninggalan situs sejarah dan nilai budayanya.', '7-9 jam'
WHERE NOT EXISTS (SELECT 1 FROM public.mountains WHERE name = 'Lawu');

INSERT INTO public.mountains (name, island, province, elevation, difficulty, description, estimated_duration)
SELECT 'Sindoro', 'Jawa', 'Jawa Tengah', 3153, 'sedang', 'Gunung berbentuk kerucut simetris di wilayah Kabupaten Temanggung dan Kabupaten Wonosobo yang berdampingan dengan Gunung Sumbing.', '6-8 jam'
WHERE NOT EXISTS (SELECT 1 FROM public.mountains WHERE name = 'Sindoro');

INSERT INTO public.mountains (name, island, province, elevation, difficulty, description, estimated_duration)
SELECT 'Sumbing', 'Jawa', 'Jawa Tengah', 3371, 'sedang', 'Gunung tertinggi kedua di Jawa Tengah yang berdampingan dengan Gunung Sindoro dan memiliki permukiman Dusun Butuh di lerengnya.', '7-9 jam'
WHERE NOT EXISTS (SELECT 1 FROM public.mountains WHERE name = 'Sumbing');


-- 2. Insert Master Data: Basecamps (10 Basecamp)

-- Semeru: Ranu Pani
INSERT INTO public.basecamps (mountain_id, name, latitude, longitude, ticket_fee, parking_motorcycle, parking_car, notes)
SELECT m.id, 'Ranu Pani', -8.014338, 112.945624, NULL, NULL, NULL, 'Pintu masuk pendakian Gunung Semeru di wilayah Senduro, Kabupaten Lumajang.'
FROM public.mountains m WHERE m.name = 'Semeru'
AND NOT EXISTS (SELECT 1 FROM public.basecamps b WHERE b.mountain_id = m.id AND b.name = 'Ranu Pani');

-- Merbabu: Selo
INSERT INTO public.basecamps (mountain_id, name, latitude, longitude, ticket_fee, parking_motorcycle, parking_car, notes)
SELECT m.id, 'Selo', -7.502850, 110.461700, NULL, NULL, NULL, 'Jalur pendakian Gunung Merbabu via Dusun Genting, Kecamatan Selo, Kabupaten Boyolali.'
FROM public.mountains m WHERE m.name = 'Merbabu'
AND NOT EXISTS (SELECT 1 FROM public.basecamps b WHERE b.mountain_id = m.id AND b.name = 'Selo');

-- Merbabu: Suwanting
INSERT INTO public.basecamps (mountain_id, name, latitude, longitude, ticket_fee, parking_motorcycle, parking_car, notes)
SELECT m.id, 'Suwanting', -7.474418, 110.399760, NULL, NULL, NULL, 'Jalur pendakian Gunung Merbabu via Dusun Suwanting, Kecamatan Sawangan, Kabupaten Magelang.'
FROM public.mountains m WHERE m.name = 'Merbabu'
AND NOT EXISTS (SELECT 1 FROM public.basecamps b WHERE b.mountain_id = m.id AND b.name = 'Suwanting');

-- Prau: Patak Banteng
INSERT INTO public.basecamps (mountain_id, name, latitude, longitude, ticket_fee, parking_motorcycle, parking_car, notes)
SELECT m.id, 'Patak Banteng', -7.178950, 109.912345, NULL, NULL, NULL, 'Jalur pendakian Gunung Prau via Desa Patakbanteng, Kecamatan Kejajar, Kabupaten Wonosobo.'
FROM public.mountains m WHERE m.name = 'Prau'
AND NOT EXISTS (SELECT 1 FROM public.basecamps b WHERE b.mountain_id = m.id AND b.name = 'Patak Banteng');

-- Gede: Cibodas
INSERT INTO public.basecamps (mountain_id, name, latitude, longitude, ticket_fee, parking_motorcycle, parking_car, notes)
SELECT m.id, 'Cibodas', -6.741230, 107.004950, NULL, NULL, NULL, 'Pintu masuk pendakian Gunung Gede Pangrango di kawasan Resort Cibodas, Kabupaten Cianjur.'
FROM public.mountains m WHERE m.name = 'Gede'
AND NOT EXISTS (SELECT 1 FROM public.basecamps b WHERE b.mountain_id = m.id AND b.name = 'Cibodas');

-- Gede: Gunung Putri
INSERT INTO public.basecamps (mountain_id, name, latitude, longitude, ticket_fee, parking_motorcycle, parking_car, notes)
SELECT m.id, 'Gunung Putri', -6.757620, 107.008290, NULL, NULL, NULL, 'Jalur pendakian Gunung Gede Pangrango via Desa Sukatani, Kecamatan Pacet, Kabupaten Cianjur.'
FROM public.mountains m WHERE m.name = 'Gede'
AND NOT EXISTS (SELECT 1 FROM public.basecamps b WHERE b.mountain_id = m.id AND b.name = 'Gunung Putri');

-- Lawu: Cemoro Sewu
INSERT INTO public.basecamps (mountain_id, name, latitude, longitude, ticket_fee, parking_motorcycle, parking_car, notes)
SELECT m.id, 'Cemoro Sewu', -7.643000, 111.192000, NULL, NULL, NULL, 'Jalur pendakian Gunung Lawu via Desa Ngancar, Kecamatan Plaosan, Kabupaten Magetan.'
FROM public.mountains m WHERE m.name = 'Lawu'
AND NOT EXISTS (SELECT 1 FROM public.basecamps b WHERE b.mountain_id = m.id AND b.name = 'Cemoro Sewu');

-- Lawu: Candi Cetho
INSERT INTO public.basecamps (mountain_id, name, latitude, longitude, ticket_fee, parking_motorcycle, parking_car, notes)
SELECT m.id, 'Candi Cetho', -7.616000, 111.163000, NULL, NULL, NULL, 'Jalur pendakian Gunung Lawu via Dusun Cetho, Desa Gumeng, Kecamatan Jenawi, Kabupaten Karanganyar.'
FROM public.mountains m WHERE m.name = 'Lawu'
AND NOT EXISTS (SELECT 1 FROM public.basecamps b WHERE b.mountain_id = m.id AND b.name = 'Candi Cetho');

-- Sindoro: Kledung
INSERT INTO public.basecamps (mountain_id, name, latitude, longitude, ticket_fee, parking_motorcycle, parking_car, notes)
SELECT m.id, 'Kledung', -7.292778, 109.988056, NULL, NULL, NULL, 'Jalur pendakian Gunung Sindoro di wilayah Kecamatan Kledung, Kabupaten Temanggung.'
FROM public.mountains m WHERE m.name = 'Sindoro'
AND NOT EXISTS (SELECT 1 FROM public.basecamps b WHERE b.mountain_id = m.id AND b.name = 'Kledung');

-- Sumbing: Butuh (Nepal van Java)
INSERT INTO public.basecamps (mountain_id, name, latitude, longitude, ticket_fee, parking_motorcycle, parking_car, notes)
SELECT m.id, 'Butuh (Nepal van Java)', -7.420609, 110.077092, NULL, NULL, NULL, 'Jalur pendakian Gunung Sumbing via Dusun Butuh, Desa Temanggung, Kecamatan Kaliangkrik, Kabupaten Magelang.'
FROM public.mountains m WHERE m.name = 'Sumbing'
AND NOT EXISTS (SELECT 1 FROM public.basecamps b WHERE b.mountain_id = m.id AND b.name = 'Butuh (Nepal van Java)');
