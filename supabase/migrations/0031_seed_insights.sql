-- Emitted by scripts/seed-insights.mjs — do not hand-edit.

insert into public.exhibitions (slug,title,excerpt,body,event_date,card_date,venue,stand,image,image_alt) values
('elysee-at-eima-international-2026-meet-us-in-bologna','Elysée at EIMA International 2026: Meet Us in Bologna!','Elysée will participate in EIMA International 2026, one of the world''s leading exhibitions for agricultural and irrigation technology. Visit us at Hall 21, Stand B28 at Fiere Expo Center in Bologna, 10–14 November 2026.','Elysée will proudly participate in EIMA International 2026, one of the world''s leading exhibitions for agricultural and irrigation technology.

For professionals in irrigation, agriculture, landscaping and water management, EIMA International is where innovation meets opportunity and Elysée is excited to be part of it once again.

At our stand, visitors will have the chance to explore Elysée''s latest irrigation solutions designed to make installations faster, easier and more efficient. From advanced fittings and connectors to smart irrigation components, our team will showcase products developed to meet the evolving needs of modern agriculture and water systems.

Whether you are a distributor, contractor, installer or industry professional, our experts will be available to discuss:

- Innovative irrigation technologies
- Efficient water management solutions
- Product demonstrations
- New product launches
- Partnership and distribution opportunities

Visit us and discover how Elysée continues to innovate in irrigation solutions.','10–14 November 2026','Nov 2026','Fiere Expo Center, Bologna','Hall 21, Stand B28','/images/insights/exhibitions/eima-2026.png','Elysée at EIMA International 2026 in Bologna'),
('eima-2022','EIMA 2022','Elysée Irrigation was present at EIMA Exhibition in Bologna, Italy, 9–13 November 2022.','We are pleased to inform you that Elysée Irrigation will be present at EIMA Exhibition, which takes place in Bologna, Italy, from the 9th until the 13th of November 2022.

We would like to invite you to our Stand B21 Hall 22 so as to be informed about the new products and services through which Elysée Irrigation can help you grow your business and market presence.

Elysee products are not only certified by the highest Standard Organizations but they also offer the best value for money by combining top quality and competitive prices.

If you would like to pre-arrange a meeting with any of our Area Managers please send us an email at marketing@elysee.com.cy','9–13 November 2022','Nov 2022','Bologna, Italy','Hall 22, Stand B21','/images/insights/exhibitions/eima-2022-signature.jpg','EIMA 2022 exhibition signature'),
('internationale-gartenbaumesse-tulln','Internationale Gartenbaumesse Tulln','Elysée participated in the Internationale Gartenbaumesse Tulln, 2–6 September 2021.','Around 450 exhibitors present everything around the garden and plants on an exhibition area of 85000m².

The international horticultural fair in Tulln is the most important for all hobby gardeners and professional gardening.

Here you will find the best tips and suggestions for planning, designing, equipment and maintaining your garden in one place.

Perfect for shopping and finding new products all around the house and garden.

You are invited to visit us on Stand 808 in hall 08.

We would like to present our latest products and answer your questions personally.

We are looking forward to your visit!','2–6 September 2021','Sep 2021','Tulln, Austria','Hall 08, Stand 808',null,null),
('eima-2021exhibition','EIMA 2021','Elysée was present at EIMA 2021 in Bologna, Italy, 19–23 October 2021, Stand B25 Hall 22.','We are pleased to inform you that Elysée Irrigation will be present at EIMA Exhibition, which takes places in Bologna, Italy, from the 19th until the 23th of October.

We would like to invite you to our Stand B25 Hall 22 so as to be informed about the new products and services through which Elysée Irrigation can help you grow your business and market presence.

Elysee products are not only certified by the highest Standard Organizations but they also offer the best value for money by combining top quality and competitive prices.

If you would like to pre-arrange a meeting with any of our Area Managers please send us an email at marketing@elysee.com.cy','19–23 October 2021','Oct 2021','Bologna, Italy','Hall 22, Stand B25',null,null),
('mce-mostra-convegno','MCE Mostra Convegno','Elysée exhibited at MCE Mostra Convegno, Stand No. L69, Pavilion 14.','Elysee will be present at the MCE Mostra Convegno which is taking place in Milan from the 17th until the 20th of March 2020. We invite you to visit our Stand No. L69 Pavilion 14.

If you would like to talk to an expert and set a meeting please send an email at: marketing@elysee.com.cy or call us at: +357 22 455 000','17–20 March 2020',null,'Milan, Italy','Pavilion 14, Stand No. L69',null,null),
('big-5-exhibition','Big 5 Exhibition','Elysée was present at the Big 5 in Dubai, Stand No. A120, Maktoum Hall.','Elysee will be present at the Big 5 which is taking place in Dubai from the 25th until the 28th of November. We invite you to visit our Stand No. A120 Maktoum Hall.

If you would like to talk to an expert and set a meeting please send an email at: marketing@elysee.com.cy or call us at: +357 22 455 000','25–28 November',null,'Dubai','Maktoum Hall, Stand No. A120',null,null)
on conflict (slug) do update set title=excluded.title, excerpt=excluded.excerpt, body=excluded.body, event_date=excluded.event_date, card_date=excluded.card_date, venue=excluded.venue, stand=excluded.stand, image=excluded.image, image_alt=excluded.image_alt;

insert into public.media (slug,title,excerpt,body,video_url,poster_image,image_alt) values
('elysee-40-year-anniversary-event','Elysée 40 Year Anniversary Event','Video recording of the Elysée 40 Year Anniversary Event, celebrating four decades of manufacturing and innovation in piping and irrigation systems.','Video recording of the Elysée 40 Year Anniversary Event, celebrating four decades of manufacturing and innovation in piping and irrigation systems.','https://www.youtube.com/embed/RGgYIZMK7GU','/images/insights/media/elysee-40-year-anniversary-event.jpg','Elysée 40 Year Anniversary Event'),
('european-business-award-2014','European Business Award 2014','Video coverage of Elysée receiving the European Business Award 2014, recognising excellence in European business.','Video coverage of Elysée receiving the European Business Award 2014, recognising excellence in European business.','https://www.youtube.com/embed/irmQi6HPS18','/images/insights/media/european-business-award-2014.jpg','European Business Award 2014'),
('cybc-documentary-innovation-in-cyprus','CYBC Documentary about Innovation in Cyprus — Elysée Irrigation','Cyprus Broadcasting Corporation documentary featuring Elysée Irrigation as a case study of innovation in Cypriot industry.','Cyprus Broadcasting Corporation documentary featuring Elysée Irrigation as a case study of innovation in Cypriot industry.','https://www.youtube.com/embed/Dh_k0xo1F8c','/images/insights/media/cybc-documentary-innovation-in-cyprus.jpg','CYBC documentary about innovation in Cyprus featuring Elysée Irrigation')
on conflict (slug) do update set title=excluded.title, excerpt=excluded.excerpt, body=excluded.body, video_url=excluded.video_url, poster_image=excluded.poster_image, image_alt=excluded.image_alt;

insert into public.ebooks (slug,title,excerpt,body,year,cover_image,image_alt,download_url) values
('green-elysee-yearly-report-2021','Green Elysée: Yearly Report 2021','Download Elysee''s 2021 Green report and learn "How Elysee aims to circle the square".','Download Elysee''s 2021 Green report and learn "How Elysee aims to circle the square"

## What''s Inside This Book

Elysée acknowledges that businesses have a tremendous impact on climate change and can help in the fight against it. For this reason, we are setting a strategic approach to help us ultimately lead the way to a circular economy model, a testimony of our commitment to quality, towards the fulfillment of our goals for sustainability. Generally, a company''s minimized carbon footprint is what leads to carbon neutrality.

We are dedicated to our dream to guide Life on a green path.

- An introduction to "Green Elysee" pillar and our Vision50
- What we have in mind for guiding Life on a green path
- Carbon Footprint: Quantifying our environmental impact
- Green Energy: Investing in renewable energy and reducing significantly the energy intensity of our production facilities
- Zero Waste: Achieving Zero-waste-to-landfill as well as diverting piping waste from landfill
- Circular Economy: Philosophy, initiatives, and Green thinking
- Green Circular products and Technologies for Circularity: High quality, safe, and innovative products, particularly circular products and technologies of circularity
- Green Policy: Investing in emissions offsetting projects

## Our Long History Uncovered

Elysee has been supplying irrigation systems for more than four decades and has successfully supplied the highest quality products to clients in over 65 countries. Over the years we have won many awards for our products and we hold many internationally renowned certificates of quality.

Being a long-established business, through our attention to detail, experience, use of state-of-the-art machinery, and diligent manufacturing of innovative and high-quality products, our long history in the irrigation industry has paved the road to targeted customer service, tailored to your specific needs.

We have a very large selection of eco-friendly, corrosion-free, durable, and easy-to-install innovative landscaping products and irrigation systems – smart, flexible, and perfect to cover all types of projects, from small gardens to large-scale landscapes.','2021','/images/insights/ebooks/green-elysee-yearly-report-2021.jpg','Green Elysée Yearly Report 2021 cover',null),
('environmental-report-2020','Environmental Report 2020','Elysée''s Environmental Report 2020, available as a direct PDF download.','Elysée''s Environmental Report 2020 is available as a direct PDF download.','2020','/images/insights/ebooks/environmental-report-2020.png','Environmental Report 2020 cover','/files/ebooks/environmental-report-2020.pdf')
on conflict (slug) do update set title=excluded.title, excerpt=excluded.excerpt, body=excluded.body, year=excluded.year, cover_image=excluded.cover_image, image_alt=excluded.image_alt, download_url=excluded.download_url;
