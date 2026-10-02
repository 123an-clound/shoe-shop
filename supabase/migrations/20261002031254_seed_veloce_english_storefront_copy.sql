-- Initial English copy for the existing VELOCE catalogue. Only fills empty
-- translations so later edits made in Admin remain untouched on reruns.
update public.veloce_products as p
set name_en = coalesce(p.name_en, t.name_en),
    description_en = coalesce(p.description_en, t.description_en),
    features_en = coalesce(p.features_en, t.features_en)
from (values
  ('aero-drift-low', 'Aero Drift Low', 'A clean low-top with a close-fitting collar and a one-piece molded rubber outsole. An easy pair to wear all week without getting tired of it.', array['Water-resistant synthetic leather upper', 'One-piece molded EVA midsole, soft and light', 'Removable antibacterial lining', '285 g (size 42)']::text[]),
  ('aero-court-high', 'Aero Court High', 'A classic basketball-inspired high top with suede at the toe. Photographs well and pairs naturally with relaxed trousers.', array['Genuine cow suede upper with hand-stitched toe', '8 cm padded collar for ankle support', 'Vulcanized rubber outsole for reliable grip', 'Rust-resistant metal eyelets']::text[]),
  ('aero-mono-black', 'Aero Mono Black', 'Black from the upper to the outsole, with no unnecessary details. The easiest pair to style for work or weekends.', array['Matte microfiber leather that resists dirt', 'One-piece black outsole that hides scuffs', 'Matching stitching with clean seams', '6 mm insole, thicker than the standard version']::text[]),
  ('aero-retro-runner', 'Aero Retro Runner', 'Inspired by 1980s running shoes, with a gently tapered toe, raised heel and three-tone colorway. Best paired with jeans.', array['Breathable mesh and suede upper', '32 mm midsole for a balanced chunky profile', 'Non-slip heel insert', 'Includes flat laces in two colors']::text[]),
  ('aero-canvas-slip', 'Aero Canvas Slip-On', 'No laces, just slip them on and go. Made with sturdy 12 oz canvas and safe for a gentle machine wash. Our most affordable bestseller.', array['Tightly woven 12 oz cotton canvas', 'Stretch side panels for easy entry', 'Vulcanized rubber outsole with non-slip tread', 'Machine washable on a gentle cycle']::text[]),
  ('aero-suede-classic', 'Aero Suede Classic', 'Cut from a single suede hide with no joined panels. The soft nap develops a richer look over time. Limited to 200 pairs.', array['Unseamed, full-panel cow suede', 'Natural crepe outsole with flexible cushioning', 'Numbered embossed label on the tongue', 'Includes a suede care kit']::text[]),
  ('aero-street-mid', 'Aero Street Mid', 'A mid-top with bold color blocking. The fit is half a size roomier than the Low, making it a good choice for wider feet.', array['Roomier fit for wider feet', 'Synthetic leather and mesh upper', 'Grooved outsole helps resist slipping', 'Available in a dedicated size 45 version']::text[]),
  ('aero-mesh-light', 'Aero Mesh Light', 'The lightest pair in the collection at just 240 g. A single-layer mesh upper keeps air moving, especially in warm weather.', array['Only 240 g per shoe (size 42)', 'Highly breathable single-layer mesh upper', 'Lightweight, responsive phylon outsole', 'Dries quickly after washing']::text[]),
  ('pulse-run-daily', 'Pulse Run Daily', 'A daily running shoe for 5–10 km routes. The midsole returns energy well and stays comfortable on paved roads.', array['Midsole returns up to 78% energy', '8 mm drop suits a midfoot landing', '360° reflective details for night runs', '265 g (size 42)']::text[]),
  ('pulse-trail-grip', 'Pulse Trail Grip', 'Built for trail running, with 5 mm lugs for grip on damp soil and loose rock. A rubber toe guard helps protect against impacts.', array['5 mm multi-directional rubber lugs', 'Rubber toe guard protects against rocks', 'Water-resistant, breathable lining', 'Quick-lace system stores inside the tongue']::text[]),
  ('pulse-gym-trainer', 'Pulse Gym Trainer', 'A flat, firm platform for stability during squats and deadlifts. Designed for the gym rather than long-distance running.', array['Flat, firm outsole for lifting stability', 'Midfoot strap locks the foot in place', 'Abrasion-resistant upper for training', '4 mm drop keeps you close to the floor']::text[]),
  ('pulse-court-tennis', 'Pulse Court Tennis', 'A hard-court tennis shoe with a reinforced heel built for sudden stops and repeated lateral movement.', array['Reinforced heel for abrupt stops', 'Herringbone outsole grips hard courts', 'Toe drag zone resists abrasion', 'Six-month outsole wear warranty']::text[]),
  ('meridian-oxford-den', 'Meridian Oxford Black', 'A sleek closed-lacing Oxford made for suits, formal events and weddings. Italian vegetable-tanned leather is hand-finished for depth of color.', array['Italian vegetable-tanned cow leather, hand-finished', 'Blake-stitched construction with a genuine leather sole', 'Long, slim last with a close-fitting heel', 'Includes cedar shoe trees']::text[]),
  ('meridian-derby-nau', 'Meridian Derby Brown', 'Open lacing makes this Derby more accommodating than an Oxford, especially for higher-volume feet. Easy to wear at work with trousers or chinos.', array['Open lacing offers more room than an Oxford', 'Vegetable-tanned cow leather develops a patina', 'Molded rubber outsole helps prevent slipping on wet floors', 'Cowhide lining helps manage odor']::text[]),
  ('meridian-wholecut', 'Meridian Wholecut', 'Cut from a single piece of leather with just one seam at the heel. A demanding shoemaking technique, and the most exclusive pair in the store.', array['Cut from one whole hide with a single seam', 'Goodyear welt construction allows resoling', 'Smooth French calfskin', 'Made to order; allow 3–4 weeks']::text[]),
  ('meridian-monk-strap', 'Meridian Double Monk Strap', 'Two buckled straps replace laces. More distinctive than an Oxford while remaining polished enough for conferences and evening events.', array['Double straps with brass-plated buckles', 'Two adjustment positions for a secure fit', 'Vegetable-tanned cow leather', 'Blake-stitched leather sole can be replaced']::text[]),
  ('meridian-brogue-cap', 'Meridian Brogue Cap Toe', 'Decorative perforations trace the toe and quarters. The most expressive Meridian style, made for anyone who appreciates thoughtful detail.', array['Hand-punched brogue perforations', 'Reinforced cap toe helps preserve its shape', 'Italian cow leather with two-tone patina', 'Goodyear-stitched leather sole']::text[]),
  ('cordell-penny-loafer', 'Cordell Penny Loafer', 'A classic penny loafer with a notched saddle. Easy to slip on and comfortable for busy days on your feet.', array['Traditional penny saddle with a keeper slot', 'Soft cow leather needs little break-in time', 'Thin rubber sole for all-day comfort', '2.5 cm heel']::text[]),
  ('cordell-suede-tassel', 'Cordell Suede Tassel Loafer', 'Soft suede with hand-sewn tassels at the toe. A relaxed statement for offices without a strict dress code.', array['Cow suede with hand-sewn tassels', 'Comfortable, lightweight crepe sole', 'Padded heel lining helps prevent slipping', 'Includes a suede care brush']::text[]),
  ('cordell-horsebit', 'Cordell Horsebit Loafer', 'A small horsebit-shaped metal detail at the toe adds polish to the whole outfit.', array['Light gold-plated brass horsebit', 'Polished calfskin resists creasing', 'Blake-stitched leather sole', 'Limited to 150 pairs']::text[]),
  ('cordell-slip-den', 'Cordell Plain Black Loafer', 'A completely plain black loafer with no ornament. A dependable choice for weddings, meetings or dinner.', array['Completely clean, ornament-free design', 'Matte cow leather resists fingerprints', 'Non-slip rubber outsole', 'Available in size 45 for larger feet']::text[]),
  ('ridge-chelsea-boot', 'Ridge Chelsea Boot', 'A lace-free Chelsea boot with elastic side panels and an ankle-height shaft. Looks best with tapered trousers.', array['Stretch side panels for quick entry', 'Braided leather pull tab at the heel', '3.5 cm chunky outsole', 'Vegetable-tanned cow leather develops a patina']::text[]),
  ('ridge-chukka-suede', 'Ridge Chukka Suede', 'A low-profile two-eyelet chukka, softer and lighter than a Chelsea boot. Suede and a crepe sole make it an easy everyday boot.', array['Two-eyelet lacing for easy on and off', 'Water-resistant cow suede', 'Natural crepe outsole is soft and light', '390 g (size 42)']::text[]),
  ('ridge-combat-boot', 'Ridge Combat Boot', 'A durable seven-eyelet boot with a deep lug sole. Built to be a dependable pair for years of regular wear.', array['Deep lug outsole grips varied terrain', 'Goodyear welt construction allows resoling', '2.0 mm thick cow leather resists scuffs', '24-month stitching warranty']::text[])
) as t(slug, name_en, description_en, features_en)
where p.slug = t.slug;

update public.veloce_categories as c
set name_en = t.name_en, description_en = t.description_en
from (values
  ('sneaker', 'Sneakers', 'Everyday sneakers you can wear all week.'),
  ('the-thao', 'Performance', 'Running, gym and tennis shoes for the right activity.'),
  ('giay-da', 'Leather Shoes', 'Oxfords, Derbies and Wholecuts for work and formal occasions.'),
  ('loafer', 'Loafers', 'Lace-free shoes you can slip on and go.'),
  ('boot', 'Boots', 'Chelsea, Chukka and Combat boots built to last.')
) as t(slug, name_en, description_en)
where c.slug = t.slug and c.name_en is null;

update public.veloce_testimonials as t
set role_en = case t.name
      when 'Nguyễn Minh Khôi' then 'Software Engineer, Ho Chi Minh City'
      when 'Trần Quốc Bảo' then 'Sales Representative, Hanoi'
      when 'Lê Hoàng Nam' then 'Architect, Da Nang'
      when 'Phạm Đức Anh' then 'Student, Binh Duong'
      when 'Vũ Thanh Tùng' then 'Recreational Runner, Can Tho'
      when 'Đỗ Gia Huy' then 'Project Manager, Hai Phong'
      else t.role_en end,
    content_en = case t.name
      when 'Nguyễn Minh Khôi' then 'My Aero Drift Low arrived in two days. Size 42 fits perfectly, so I did not need an exchange. After three months of regular wear, the sole still looks good.'
      when 'Trần Quốc Bảo' then 'I bought the brown Meridian Derby for work. The leather was comfortable right away, without the painful break-in my old pair needed. Worth the price.'
      when 'Lê Hoàng Nam' then 'The Ridge Chelsea Boot looks great with tapered trousers. It felt a little heavy at first, but I got used to it after a few days.'
      when 'Phạm Đức Anh' then 'The Aero Canvas Slip-On is affordable and well made. I have machine-washed it twice and the sole is still holding.'
      when 'Vũ Thanh Tùng' then 'I can run 8 km in the Pulse Run Daily without heel soreness. The reflective strip also makes evening runs feel safer.'
      when 'Đỗ Gia Huy' then 'The Cordell Penny Loafer is easy to slip on and works well for a day full of meetings. I only wish the black color had been in stock.'
      else t.content_en end
where t.content_en is null;

update public.veloce_settings
set slogan_en = coalesce(slogan_en, 'Your own way forward'),
    hero_headline_en = coalesce(hero_headline_en, 'Men’s shoes. No compromises.'),
    hero_subheadline_en = coalesce(hero_subheadline_en, 'From everyday sneakers to leather shoes for life’s biggest moments — find the pair that feels right for you.'),
    hero_cta_label_vi = coalesce(hero_cta_label_vi, 'Khám phá bộ sưu tập'),
    hero_cta_label_en = coalesce(hero_cta_label_en, 'Explore the collection'),
    hero_secondary_label_vi = coalesce(hero_secondary_label_vi, 'Xem sản phẩm mới'),
    hero_secondary_label_en = coalesce(hero_secondary_label_en, 'Shop new arrivals'),
    seo_title_vi = coalesce(seo_title_vi, store_name || ' — Giày nam chất lượng'),
    seo_title_en = coalesce(seo_title_en, store_name || ' — Men’s footwear'),
    seo_description_vi = coalesce(seo_description_vi, slogan),
    seo_description_en = coalesce(seo_description_en, 'Thoughtfully made footwear for everyday life, work and the moments that matter.')
where id = 1;
