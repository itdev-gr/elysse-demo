-- Seed the full blog imported from elysee.com.cy (all posts + re-hosted images).
-- Replaces the 5 hand-written sample posts from 0003_seed_blog_posts.sql.
-- Idempotent: re-running upserts every post by slug.

delete from public.posts where slug in ('zeeflex-fittings-pool-plumbing', 'elysee-zero-force-range-improved', 'elysee-global-transition-range', 'pvc-fittings-for-waste-and-soil-systems', 'elysee-irrigation-great-place-to-work');

insert into public.posts
  (slug, title, excerpt, body, cover_image, author, published_at, reading_minutes, is_published)
values
('elysee-ecogreen-series-receives-dvgw-certification',
 'Elysée EcoGreen Series Receives DVGW Certification',
 'We are proud to announce that the Elysée EcoGreen Series (16mm, 20mm, 25mm, and 32mm) has officially received DVGW certification.',
 $md$We are proud to announce that the Elysée EcoGreen Series (16mm, 20mm, 25mm, and 32mm) has officially received DVGW certification.

This achievement marks another important step in Elysée’s vision to become a global green leader, driving sustainability and innovation in water infrastructure solutions.

The EcoGreen Series has been developed with circularity at its core. By incorporating recyclable materials into selected fitting components, we are helping reduce the consumption of virgin raw materials while promoting a more sustainable and responsible use of resources.

What makes this achievement even more significant is that sustainability comes without compromise. The EcoGreen Series delivers the same quality, reliability, durability and performance as fittings produced entirely from virgin materials, now independently verified through the rigorous DVGW certification process.

✅ Certified quality and performance
✅ Compliance with internationally recognized standards
✅ Reliable solutions for water supply and irrigation systems
✅ Support for circular economy and sustainability goals
✅ Same proven properties as conventional fittings

At Elysée, sustainability is not simply a target, it is part of who we are. Through innovative solutions like the EcoGreen Series, we continue to create smarter, greener, and more future-ready water systems while preserving resources for generations to come.

A sincere thank you to our customers, partners and team members who continue to support our journey towards a more sustainable future.![ecogreen-post-QfLIO.png](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/elysee-ecogreen-series-receives-dvgw-certification/ecogreen-post-QfLIO.png)$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/elysee-ecogreen-series-receives-dvgw-certification/ecogreen-post.png',
 'Elysée Group',
 '2026-06-17T12:00:00Z',
 2,
 true),
('oloklhrwmenh-seira-stalakthforwn-swlhnwn-elysee-prime',
 'Ολοκληρωμένη Σειρά Σταλακτηφόρων Σωλήνων - Elysee Prime',
 'Η Elysee Prime είναι ένας κορυφαίος κατασκευαστής σωλήνων πολυαιθυλενίου που συμμορφώνεται με τα ευρωπαϊκά πρότυπα. Ιδρύθηκε ως συνεργασία μεταξύ της Elysee Irrigation Ltd.',
 $md$Η Elysee Prime είναι ένας κορυφαίος κατασκευαστής σωλήνων πολυαιθυλενίου που συμμορφώνεται με τα ευρωπαϊκά πρότυπα. Ιδρύθηκε ως συνεργασία μεταξύ της Elysee Irrigation Ltd. και του Ομίλου SHIRA τον Μάρτιο του 2023 στην Αίγυπτο. Οι κυλινδρικοί σταλακτηφόροι σωλήνες που κατασκευάζονται από την Elysee Prime ξεχωρίζουν την εξαιρετική τους ποιότητα, αποδοτικότητα, ευελιξία και προσιτή τιμή. Είναι κατάλληλοι για επιφανειακή στάγδην άρδευση, χώρους πρασίνου, γεωργικές εφαρμογές και θερμοκήπια και διατίθενται σε διάφορα μεγέθη σωλήνων, σταλάκτες, αποστάσεις και παροχές, με μεγάλη ευελιξία στην παραγωγή εξατομικευμένων σταλακτηφόρων σωλήνων σύμφωνα με τις ανάγκες του πελάτη.

Ο σταλακτηφόρος σωλήνας LUXOR PC-ND αποτελεί ιδιαίτερα προτεινόμενη επιλογή για έργα διαμόρφωσης τοπίου, ειδικά σε επικλινή αγροτεμάχια και σε τοποθεσίες όπου απαιτούνται συχνοί κύκλοι άρδευσης.

Οι σταλακτηφόροι σωλήνες MORFOU PC είναι αξιόπιστη και αποδοτική λύση για διάφορες γεωργικές εφαρμογές, συμπεριλαμβανομένων των φυτωρίων, των θερμοκηπίων και των υδροπονικών συστημάτων που απαιτούν ακρίβεια στην παροχή νερού και λίπανσης.

Ο σταλακτηφώρος σωλήνας NAPA είναι εξαιρετικός για την άρδευση πολυετών και εποχικών γραμμικών καλλιεργειών, δέντρων, οπωρώνων, λαχανικών, κήπων και χώρων πρασίνου. Χάρη στον σχεδιασμό του σταλάκτη 3D, προσφέρει υψηλότερη απόδοση, ιδιαίτερα όσον αφορά την αντοχή στο φράξιμο, καθιστώντας τον εξαιρετική επιλογή για επαγγελματίες διαμόρφωσης τοπίου ή αγρότες. Σε σύγκριση με το προηγούμενο μοντέλο, ο NAPA είναι ένας προηγμένος συμβατικός σταλακτηφόρος σωλήνας που προσφέρει σημαντικά πλεονεκτήματα. Οι σταλακτηφόροι σωλήνες ΝΑPA είναι υψηλής αντοχής με πάχος τοιχώματος σωλήνα μεγαλύτερο από 1.1mm όπου ο ανταγωνισμός δεν υπερβαίνει τα 0.90mm. H διαφορά στο πάχος τοιχώματος προσφέρει σημαντική αντοχή και αυξάνει την περίοδο λειτουργίας του σωλήνα κάτι που επιτρέπει την επαναχρησιμοποίηση του σωλήνα για περισσότερα χρόνια. Η τεχνολογία 3 στρομάτων υλικού επιτρέπει τον συνδυασμό υλικών και την χρήση αναγεννημένου υλικού χωρίς να υστερεί στην ποιότητα του τελικού προϊόντος.![image-ioiNN.png](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/oloklhrwmenh-seira-stalakthforwn-swlhnwn-elysee-prime/image-ioiNN.png)$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/oloklhrwmenh-seira-stalakthforwn-swlhnwn-elysee-prime/image-J6XWQ.png',
 'Elysée Group',
 '2026-06-16T12:00:00Z',
 2,
 true),
('make-irrigation-easy-with-elysee-s-swivel-fittings',
 'Make Irrigation Easy with Elysée’s Swivel Fittings',
 'Connecting pipes in tight spaces, such as small valve boxes, can be a huge headache. Elysée’s new series of swivel fittings is here to solve that problem.',
 $md$Connecting pipes in tight spaces, such as small valve boxes, can be a huge headache. Elysée’s new series of swivel fittings is here to solve that problem. Designed for water and irrigation systems, these fittings are incredibly easy to use. They take the stress out of plumbing jobs and guarantee a secure, leak-free fit every time.

Elysée’s comprehensive new series of swivel fittings offers unmatched convenience and flexibility. These fittings are engineered to eliminate the hassle of complex plumbing and irrigation layouts.

One of the key features of these swivel fittings is their ergonomic and durable design. The rotating nut allows for quick and easy connections to threaded pipes and irrigation components with a one-inch thread.

Because connections can be tightened simply by hand, physical strain is significantly reduced, speeding up both initial installation and future maintenance.

Traditional O-rings can sometimes fall short, especially when components don’t align perfectly. Elysée has addressed this issue by using a high-quality rubber seal.

This advanced sealing method allows for secure, leak-free installations even at a 15° angle, a common occurrence when assembling components inside tight valve boxes. Best of all, it provides a perfect seal without the need for PTFE tape or any other messy sealing materials.

No matter what your landscape project looks like, there is a fitting to match. The Elysée swivel series are all of 1 inch and includes:
• Manifolds (2, 3, or 4 outlets)
• Couplings, elbows, tees, and crosses

Swivel options are also available with adaptors and elbows in 25 mm × 1″ and 32 mm x 1″

Irrigation systems are exposed to harsh weather, UV rays, chemicals and fertilizers. Elysée’s swivel fittings are manufactured from high-quality, corrosion-resistant materials that provide both strength and flexibility.

**Why Choose Elysée Swivel Fittings?**
Here’s what makes this new series a must-have for your inventory or toolbelt:
• Time-saving: Tool-free, hand-tight installation with no need for sealing tape
• Forgiving design: Maintains a secure seal even with up to 15° misalignment
• Durable: Made from PP-B, POM and EPDM70 to withstand harsh conditions and UV exposure
• Versatile: A wide range of configurations to suit any system layout

Upgrade your irrigation systems with Elysee’s swivel fittings today and experience the difference that smart, ergonomic engineering makes in the field!![swivel-fittings-banner-w2xwn.png](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/make-irrigation-easy-with-elysee-s-swivel-fittings/swivel-fittings-banner-w2xwn.png)$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/make-irrigation-easy-with-elysee-s-swivel-fittings/swivel-fittings-banner.png',
 'Elysée Group',
 '2026-06-12T12:00:00Z',
 2,
 true),
('the-ultimate-solution-for-pool-plumbing-zeeflex-fittings',
 'The Ultimate Solution for Pool Plumbing: ZEEFLEX fittings',
 'When installing or upgrading a swimming pool, a leak free plumbing system is essential.',
 $md$When installing or upgrading a swimming pool, a leak-free plumbing system is essential. Leaks, weather degradation and chemical wear can quickly turn a relaxing oasis into a costly maintenance nightmare.

ZEEFLEX fittings by Elysée Irrigation are specifically designed to make connecting flexible PVC pool hoses simple, secure and incredibly durable. Here is everything you need to know about why ZEEFLEX should be your go-to connection choice.

The Perfect Fit & Smart Design ZEEFLEX fittings are engineered for seamless integration into your existing setups.

- Available Sizes: Specifically designed for standard 50 mm and 63 mm flexible PVC hoses.
- Easy to Connect: They feature a secure mechanical grip on one side, transitioning to your choice of a glued or threaded connection (male/female) on the other.

Built to withstand the elements pool environments require plumbing that can stand up to constant water flow, sanitizing chemicals and outdoor exposure. ZEEFLEX handles it all easily:

- Chemical & Weather Resistant: Built from premium plastics that easily handle pool chemicals and protect against UV radiation degradation.
- Tough and Rust-Proof: The high-impact materials withstand abrasive fluids and heavy use. Because they are 100% plastic, you never have to worry about rust or electrolytic corrosion.
- Beyond Water: Thanks to their high chemical resistance, these fittings can safely convey a wide variety of fluids, not just water. _(Contact us for advice on specific industrial applications!)_

- Max Operating Pressure: Up to 6 bars (at 20⁰C)
- Max Operating Temperature: Up to 50°C (matching the spiral pipe limits)

You do not have to guess when it comes to reliability. Elysée mechanical compression fittings are rigorously tested in-house for pressure limits, leak tightness, bending and hygiene. They are approved by leading global certification bodies and meet strict international manufacturing standards:

- Global Approvals: DVGW (Germany), KIWA (Netherlands), WRAS (Great Britain), and BV (Australia).
- ISO Standards: 14236, 3458, 3459, 3501, and 3503.
- EN Standards: 12201, 712, 713, 715, and 911.
- DIN & AS/NZS Standards: DIN 8076 (Performance Series) and AS/NZS 4129.

Ready to upgrade your pool plumbing? Contact us today to learn more about adding ZEEFLEX fittings to your next project!![zeeflex-2.png](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/the-ultimate-solution-for-pool-plumbing-zeeflex-fittings/zeeflex-2.png)$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/the-ultimate-solution-for-pool-plumbing-zeeflex-fittings/zeeflex-2.png',
 'Elysée Group',
 '2026-05-19T12:00:00Z',
 2,
 true),
('meet-the-new-and-improved-elysee-zero-force-range',
 'Meet the New and Improved Elysée Zero Force Range',
 'We’re thrilled to announce that we’ve upgraded the Elysée Zero Force range (75mm–110mm) with new, refined technology specifically designed to make your job faster, smoother and easier than ever…',
 $md$We’re thrilled to announce that we’ve upgraded the Elysée Zero Force range (75mm–110mm) with new, refined technology specifically designed to make your job faster, smoother and easier than ever before.

**How It Works**

The standout feature of the upgraded Zero Force system is its highly intuitive semi push-fit design. This means you don't have to fully unscrew the cap to insert the pipe. Not anymore!

With our refined technology, there’s no need to fully unscrew the cap to insert the pipe. How it works in 3 simple steps:

- Loosen: Unscrew the cap 1 full turn.
- Push: Simply push the pipe all the way into the fitting. You will experience absolute zero insertion force during this step.
- Tighten: Once the pipe is fully seated, just tighten the cap to secure it in place.

Thanks to the improved design mechanics, making sure the pipe is fully inserted guarantees a rock-solid, secure connection.

**Key Benefits at a Glance:**

- Zero insertion force for effortless pipe installation
- Proven leak-free secured system for total peace of mind
- Time-saving design that gets you to the next job faster

Upgrading your tools means upgrading your workday. The new Elysée Zero Force range in 75mm–110mm is built to take the physical strain out of installations, giving you a perfect, leak-free connection every single time. Why settle for hard work when you can have Zero Force?

Want to see exactly how smooth this new system is in action? Watch the how-to video **[here](https://www.youtube.com/shorts/5i3Y_xP2NDI)**![untitled-design-1-Ms212.png](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/meet-the-new-and-improved-elysee-zero-force-range/untitled-design-1-Ms212.png)$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/meet-the-new-and-improved-elysee-zero-force-range/untitled-design-1-Ms212.png',
 'Elysée Group',
 '2026-05-18T12:00:00Z',
 2,
 true),
('the-ultimate-connection-why-the-elysee-global-transition-range-is-a-game-changer',
 'The Ultimate Connection: Why the Elysée Global Transition Range is a Game-Changer!',
 'In the world of irrigation, plumbing and industrial piping the biggest headache is often the "mismatch." Whether you''re working with old metal pipes or newer plastic ones, connecting different…',
 $md$In the world of irrigation, plumbing and industrial piping the biggest headache is often the "mismatch." Whether you're working with old metal pipes or newer plastic ones, connecting different materials securely has usually meant using lots of adapters and hoping everything fits.

The Elysée Global Transition Range isn’t just another fitting, it’s a truly universal solution designed to connect virtually any pipe material to any other, including polyethylene (PE), copper, galvanized iron, lead, PVC, stainless steel and ABS across a wide range of sizes.

The standout feature of the Global Transition Tee is its sheer versatility. Thanks to a specially engineered thick rubber seal, this coupling compensates for variations in both pipe diameter and material quality.

Whether you're joining plastic to metal or fixing an old, worn pipe the Elysée system gives you a reliable, watertight seal every time.

What makes this coupling a favourite among installers? It’s all in the engineering:

- Zero Insertion Force: Forget the struggle of forcing pipes into tight grips. The design allows for easy installation, reducing physical strain and saving time on-site.
- Ergonomic Design: With a modern cap design and unique shape, it’s built for easy handling, even in tough working conditions.
- Built to Last: Made from top-quality, certified raw materials, these couplings are essentially "unbreakable" and designed for a lifetime of operation with zero maintenance.
- Safety First: It conforms to all international standards and meets strict hygiene and sanitary requirements, making it safe for a wide range of applications.

Our solution is designed to deliver flexibility, durability, and reliable performance across a wide range of applications:

- Universal Compatibility – Easily connects pipes of different diameters and materials, including both metal and plastic.
- Enhanced Sealing Performance – A thick rubber seal helps compensate for uneven surfaces and lower-quality pipe conditions.
- Extended Pressure Coverage – A longer pressure zone adds extra security, especially around pipe ends.
- Reliable, Leak-Free Operation – Engineered for consistent performance with a proven record of preventing leaks under pressure.

If you are looking for a "fit and forget" solution that eliminates the need for complex adapters, the Elysée Global Transition Range is your answer. It’s built for the toughest conditions, designed for the easiest installation and guaranteed to keep your system leak-free for years to come.

The Elysée Global Transition includes a full range of fittings to cover every installation need:

- Coupling Global Transition Metric
- Coupling Global
- Elbow Global
- Tee Global
- Coupling Global Swivel![global-series.png](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/the-ultimate-connection-why-the-elysee-global-transition-range-is-a-game-changer/global-series.png)$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/the-ultimate-connection-why-the-elysee-global-transition-range-is-a-game-changer/banner-1920x600.png',
 'Elysée Group',
 '2026-04-22T12:00:00Z',
 3,
 true),
('neo-koyti-hlektrologoy-elysee-kainotomia-kai-antoxh-sthn-aixmh-ths-egkatastashs',
 'Νέο Κουτί Ηλεκτρολόγου Elysée: Καινοτομία και Αντοχή στην Αιχμή της Εγκατάστασης',
 'Το νέο Κουτί Ηλεκτρολόγου (Μονό και Διπλό) της Elysée δεν είναι απλώς ένα εξάρτημα, αλλά ένα νέο πρότυπο στην τεχνολογία κουτιών σύνδεσης.',
 $md$Το νέο **Κουτί Ηλεκτρολόγου (Μονό και Διπλό)** της **Elysée** δεν είναι απλώς ένα εξάρτημα, αλλά ένα νέο πρότυπο στην τεχνολογία κουτιών σύνδεσης. Σχεδιασμένο με γνώμονα την πρακτικότητα και την ποιότητα, έρχεται να καλύψει τις υψηλές απαιτήσεις των σύγχρονων ηλεκτρολογικών εγκαταστάσεων.

**Γιατί να επιλέξετε το Κουτί Ηλεκτρολόγου της Elysée;**

Στην Elysée, κατανοούμε ότι ο χρόνος και η αξιοπιστία είναι το παν για έναν επαγγελματία. Γι' αυτό δημιουργήσαμε μια λύση που συνδυάζει:

- **Απαράμιλλη Ανθεκτικότητα:** Κατασκευασμένο για μακροχρόνια χρήση, αποτελεί μια στιβαρή επιλογή που ελαχιστοποιεί την ανάγκη για μελλοντικές αντικαταστάσεις.
- **Ευκολία στη Συντήρηση:** Ο καινοτόμος σχεδιασμός επιτρέπει την ταχύτατη αντικατάσταση εξαρτημάτων, μειώνοντας δραστικά τον χρόνο διακοπής εργασιών.
- **Οικονομική Αποδοτικότητα:** Προσφέρουμε μια premium λύση σε ανταγωνιστική τιμή, εξασφαλίζοντας την καλύτερη σχέση ποιότητας-τιμής στην αγορά.

**Τεχνικά Χαρακτηριστικά & Απόδοση**

1. **Στιβαρή Κατασκευή από ABS**

Το κουτί είναι κατασκευασμένο από **υψηλής ποιότητας ABS**, υλικό που το καθιστά άκαμπτο και ανθεκτικό στα σπασίματα. Έχει δοκιμαστεί σε ακραίες συνθήκες, διατηρώντας το σχήμα και τη λειτουργικότητά του σε θερμοκρασίες από **\-5 °C έως 60 °C**.

2. **Έξυπνη Αντικατάσταση Παξιμαδιού**

Ένα από τα σημαντικότερα προβλήματα στις εγκαταστάσεις λύνεται οριστικά: αν ένα παξιμάδι φθαρεί ή αστοχήσει, μπορεί να αντικατασταθεί **εύκολα και γρήγορα** χωρίς να χρειάζεται ξήλωμα όλης της εγκατάστασης.

3. **Απόλυτη Συμβατότητα**

Το νέο κουτί υποστηρίζει την άμεση εισαγωγή ηλεκτρολογικών σωλήνων διαμέτρου **16mm και 20mm**. Η διαδικασία σύνδεσης είναι πλέον πιο απλή από ποτέ, εξοικονομώντας πολύτιμο χρόνο στο εργοτάξιο.

**Σχεδιασμένο από Επαγγελματίες για Επαγγελματίες**

"Η καινοτομία μας πηγάζει από την επικοινωνία με την αγορά."

Για την ανάπτυξη του προϊόντος, η Elysée συνεργάστηκε στενά με ηλεκτρολόγους και τεχνικούς, καταγράφοντας τα προβλήματα των υπαρχόντων λύσεων της αγοράς. Το αποτέλεσμα είναι ένα προϊόν **πελατοκεντρικό**, που προσφέρει:

- **Ευελιξία:** Ιδανικό για κάθε είδους τοίχο και υλικό.
- **Εργονομία:** Ελαφριά κατασκευή που δεν κουράζει, αλλά αντέχει στις πιο δύσκολες συνθήκες.
- **Επαγγελματικό Φινίρισμα:** Εξασφαλίζει ένα άρτιο αισθητικά και λειτουργικά αποτέλεσμα που αναβαθμίζει την εικόνα της δουλειάς σας.

Είτε πρόκειται για μια νέα οικοδομή είτε για ανακαίνιση, το **Κουτί Ηλεκτρολόγου της Elysée** είναι η εγγύηση για μια ασφαλή, γρήγορη και ποιοτική εγκατάσταση.

**Ενδιαφέρεστε για περισσότερες λεπτομέρειες;**

- 📺 [Πατήστε εδώ για να δείτε το](https://www.youtube.com/watch?v=NprWkfCCoOk) [το βίντεο του προϊόντος](https://www.youtube.com/watch?v=NprWkfCCoOk)

- 📄 Κατεβάστε το Τεχνικό Φυλλάδιο (PDF \] Κουτι Ηλεκτρολογου.pdf$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/neo-koyti-hlektrologoy-elysee-kainotomia-kai-antoxh-sthn-aixmh-ths-egkatastashs/picture1-ImDS3.png',
 'Elysée Group',
 '2026-02-24T12:00:00Z',
 2,
 true),
('pvc-fittings-and-pipes-for-waste-and-soil-systems',
 'PVC Fittings and Pipes for Waste and Soil Systems',
 'For soil and waste disposal systems in homes, businesses, and public buildings, Elysée Piping provides an extensive selection of uPVC pipes and fittings.',
 $md$For soil and waste disposal systems in homes, businesses, and public buildings, Elysée Piping provides an extensive selection of uPVC pipes and fittings.

Our systems completely conform with the European standard EN 1329, guaranteeing safe, hygienic and long-lasting performance. They are appropriate for above-ground installations (B) and near-building subterranean applications (D).

**Material and Product Range**

Elysée pipes and fittings are safer for both humans and the environment because they are composed of unplasticized polyvinyl chloride (PVC-U) and employ stabilizers free of lead.

The product range includes:

- Bends
- Branches
- Reducers
- Access fittings
- Traps
- Caps

For long-lasting and leak-free installations, all fittings are made with robust sealing systems.

**Application Areas**

Elysée uPVC soil and waste systems can be utilized in a variety of construction and infrastructure projects because they are made for non-pressurized applications.

They are appropriate for:

- Soil and waste discharge systems in homes, commercial and public buildings
- Ventilation stacks and sanitary discharge lines
- Rainwater downpipes connected to indoor drainage
- Kitchen, bathroom, laundry and utility piping
- Overflow connections for washbasins, WCs, urinals and showers
- Drainage systems in garages, shopping malls, factories and stadiums
- Underground installations within 1 meter of the building
- Electrical conduit and communication ducting (non-pressure)
- Drainage systems in tunnels, transport hubs and subways

**Standards and Certifications**

Elysée uPVC soil and waste systems are manufactured in compliance with European standards.

- EN 1329 applies to sizes from 32 mm to 110 mm
- EN 1401 applies to 110 mm fittings

All products are quality tested to ensure strength, leak tightness and long-term performance.

**Key Benefits of uPVC**

- Easy installation using solvent cement welding
- Lightweight, clean and easy to handle
- No taste or odour
- Does not support combustion
- Helps reduce condensation
- Smooth internal surface for better flow and fewer blockages
- Resistant to most corrosive liquids
- Non-conductive, not affected by electrical or chemical reactions

**A Trustworthy Drainage Option**

Elysée uPVC pipes and fittings provide a dependable and long-lasting solution for soil and waste drainage in contemporary structures thanks to their verified quality control and adherence to European standards.

👉 Explore our uPVC Pipes & Fittings range: https://bit.ly/49Iu8tW

👉 Download the product catalogue: PVC & Pipes.pdf

If you need help selecting the right uPVC for your application, our team is always ready to assist.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/pvc-fittings-and-pipes-for-waste-and-soil-systems/20260114-140841.png',
 'Elysée Group',
 '2026-01-28T12:00:00Z',
 2,
 true),
('epsilon-series-compression-fittings-simple-strong-and-reliable',
 'Epsilon Series Compression Fittings: Simple, strong and reliable!',
 'When you need a connection you can trust, things should be simple, safe and long lasting. That’s exactly what the Epsilon Series compression fittings (PN 16 bar) from Elysée are designed to offer.',
 $md$When you need a connection you can trust, things should be simple, safe and long-lasting. That’s exactly what the Epsilon Series compression fittings (PN 16 bar) from Elysée are designed to offer.

The Epsilon Series offers performance and simple installation regardless of whether you're working with water, air or other fluids under pressure.

**What Are Epsilon Compression Fittings?**

Epsilon fittings are mechanical connectors that firmly attach pipes without the need for maintenance or complex tools. They can be used to carry:

- Water, including potable water
- Compressed air
- Gaseous fuels
- Chemical solutions and slurries

After installation, the fitting performs its function in a reliable and quiet way.

**Safe for Drinking Water**

Epsilon fittings are produced according to international health and safety standards making them suitable for potable water and fluids for human consumption. They are tested regularly and approved by the most reputable and recognised certification organizations worldwide to be used with confidence.

Each Epsilon fitting is made up of carefully selected components that work together as one system:

- A strong polypropylene body that handles pressure and impact
- A rubber seal that prevents leaks
- An insert sleeve that keeps everything perfectly aligned
- A split ring that grips the pipe securely
- An ergonomic nut for easy tightening

**Where Are Epsilon Fittings Used?**

Epsilon fittings are used in numerous domestic and commercial applications such as:

- Irrigation systems
- Water supply networks
- Industrial pipelines
- Compressed air installations

They’re ideal wherever reliability and long service life are essential.

If you’d like to explore the technical details or see the full range of available fittings, you can find them here:

👉 **Explore our full Epsilon Series range here:** https://bit.ly/4pNH32g

👉 **View the Epsilon Series Technical Flyer:** Epsilon Series.pdf

If you need help selecting the right saddle for your application, our team is always ready to assist.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/epsilon-series-compression-fittings-simple-strong-and-reliable/331-coupling.png',
 'Elysée Group',
 '2026-01-21T12:00:00Z',
 2,
 true),
('everything-you-need-to-know-about-saddles-and-their-significance',
 'Everything you need to know about saddles and their significance',
 'When it comes to piping systems such as irrigation, water distribution, chemical transportation and more, it is often the smallest details that matter the most.',
 $md$When it comes to piping systems such as irrigation, water distribution, chemical transportation and more, it is often the smallest details that matter the most. Examples of critical details would be the placement of the saddle, which is the perfect fitting for connecting a secondary line to the main line.

Elysée has a full range of high-quality saddles to help make the process of pipe derivation easy, safe and durable even in challenging environments.

What is a saddle and how does it work?

The saddle is the fitting that is connected directly to a main pipe whenever a branch needs to be created without cutting or replacing it. It is easily installed in pipes by placing it around the pipe, connecting the outlet to a secondary line.

This makes saddles ideal for:

- Expanding irrigation or any other networks
- Adding new outlets to existing pipelines
- High-pressure water systems
- Chemical and slurry handling

**Built for strength, safety and durability**

Elysée saddles are manufactured from high-grade polypropylene, ensuring excellent mechanical strength and long service life. They are designed to perform reliably in outdoor environments and under pressure.

Key benefits include:

- Wide compatibility with pipe diameters from 20mm to 315mm
- Threaded outlets from ½” to 4”, suitable for multiple applications
- Excellent resistance to chemicals, fertilizers, and slurries
- UV resistance, making them ideal for outdoor installations
- Safe for potable water systems

**Designed for secure and leak-free performance**

Every detail of the Elysée saddle is engineered for reliability:

- Nitrile sealing gaskets (O-Ring or Flat) ensure excellent sealing and chemical resistance
- Stainless steel reinforcement ring strengthens the threaded outlet and improves stability
- Axial and radial teeth prevent movement or rotation on the pipe
- Reinforcing ribs help the saddle withstand long-term stress and pressure
- Hexagonal grooves and bolt guides make installation faster and more accurate

**The result?** A tight, secure connection you can trust even under demanding operating conditions.

**Flexible options for every application**

Elysée saddles are available in:

Various models of saddles are available at Elysée such as: Single, Double, Reinforced, Reinforced with stainless steel screws & bolts, with “O” ring and/or Flat seal

This variety allows installers and engineers to choose the exact configuration needed for their system without compromise.

**Why choose Elysée saddles?**

✔ Easy installation
✔ Strong and durable materials
✔ Excellent sealing performance
✔ Suitable for irrigation, water conveyance, and chemicals
✔ Customizable labeling for easy identification

Whether you’re designing a new system or upgrading an existing one, Elysée saddles provide a smart, efficient and dependable solution.

👉 **Explore our full Saddle product range here:** https://bit.ly/4bt6YJt

👉 **View the Product Catalogue:** Saddles.pdf

If you need help selecting the right saddle for your application, our team is always ready to assist.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/everything-you-need-to-know-about-saddles-and-their-significance/550-saddle-single-4-bolts.jpg',
 'Elysée Group',
 '2026-01-21T12:00:00Z',
 3,
 true),
('h-elysee-irrigation-pistopoieitai-ws-great-place-to-work',
 'Elysée Irrigation Certified as a Great Place To Work®',
 'Elysée Irrigation, one of the largest and most modern factories producing water supply and irrigation systems in Cyprus and Europe, with exports to 70 countries, has achieved the Great Place To Work®…',
 $md$Elysée Irrigation, one of the largest and most modern factories producing water supply and irrigation systems in Cyprus and Europe, with exports to 70 countries, has achieved the Great Place To Work® certification, tangibly confirming its commitment to creating a modern, safe, and people-centered working environment.

The certification resulted from the internationally recognized Trust Index® employee survey, which objectively captures employees’ experience, the level of trust, respect, and the overall workplace culture of a company.

### A significant distinction for the industrial sector

In his statement, the General Manager of Great Place To Work® Cyprus, Mr. Kyriakos Iakovidis, noted that this distinction, in a sector with particular and increased demands, is proof of Elysée Irrigation’s substantial investment in its people.

As he pointed out, the certification confirms the creation of a working environment that enhances professional satisfaction, well-being, and the continuous development of employees, while at the same time strengthening the company’s public image and offering a significant competitive advantage in attracting talented professionals to the sector.

### Our people at the center

On behalf of Elysée Irrigation, the Head of the Human Capital and Corporate Systems Department, Ms. Giannoula Pattichi, stated:

“We are particularly proud that our company has been certified as a Great Place To Work®. This distinction is a recognition of our consistent commitment to cultivating a positive and safe working environment, in which our people feel trust, respect, and appreciation.

The certification confirms our continuous dedication to the development, well-being, and active participation of our people in the ongoing progress of Elysée Irrigation. With this important recognition, we continue even more dynamically our efforts for continuous improvement and the strengthening of our corporate culture.”

### We continue to invest in our people

The Great Place To Work® certification constitutes for Elysée Irrigation not only a significant distinction, but also a strong incentive for continuous evolution. With a steady focus on quality, innovation, and above all on its people, the company continues to invest in practices that enhance trust, collaboration, and sustainable development.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/h-elysee-irrigation-pistopoieitai-ws-great-place-to-work/thumbnail-image001.png',
 'Elysée Group',
 '2026-01-07T12:00:00Z',
 2,
 true),
('our-journey-to-becoming-a-green-leader',
 'Our journey to becoming a green leader',
 'The implementation and practice of circular economy, which forms an essential part of any organization’s strategic planning, has definitely entered the modern business world.',
 $md$The implementation and practice of circular economy, which forms an essential part of any organization’s strategic planning, has definitely entered the modern business world. The circular economy concept aims at reducing waste as much as possible and, in effect, a product’s life cycle is extended to the maximum. Essentially, the goal is that each product is reused, repaired, recycled, and/or refurbished. Due to this, circular economy promotes a carbon-neutral way of manufacturing, which is environmentally friendly and offers alternative ways of economic flourishment, away from the consumption of finite resources and energy sources.![our-journey-to-becoming-a-green-leader-1.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/our-journey-to-becoming-a-green-leader/our-journey-to-becoming-a-green-leader-1.jpg)

Elysee is committed to adopting a circular economy mindset and investing in emissions-offsetting projects for becoming a green leader in the industry. This is evident from various actions and initiatives that the company has already implemented. Foremost, we are one of the first companies in Cyprus to calculate their carbon footprint on a regular basis, i.e., every three months. Specifically for 2021, our carbon footprint was calculated to be 0.0025 tnCO2eq/kg. At the same time, in order to fight the environmental crisis, Elysee bought the first electric vehicle of the Elysée fleet for its product deliveries. Also, since 2021, we have been replacing our water pumps with a newer type of pumps that offer significantly higher efficiency while requiring less energy. What is important to note is that 30% of our energy use is currently produced by the photovoltaic system at our company's facilities, while, by the end of 2023, we believe that 40% of our production operations will be powered by solar energy. Overall, due to PV Panels, 1,15MWh or 20% of total consumption was saved, that is, 795tnCO2eq, Furthermore, we have developed a PV washing piping system which, according to studies, has a 3% increase in PV efficiency.![our-journey-to-becoming-a-green-leader-2.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/our-journey-to-becoming-a-green-leader/our-journey-to-becoming-a-green-leader-2.jpg)

As part of these measures, the company uses LED in all internal spaces of the factory, which means 20% fewer GHG emissions from lighting. What’s more, we replaced our chillers with a newer type that has higher COP and the split units with central heating-cooling systems (VRV). We are proud of our green policy to only use licensed streams and achieve 100% waste management while all non-household waste is being recycled at licensed recycling points in Cyprus. Our goal is not only to find energy saving solution but also to compromise the existing damage to our planet. To this end, we have started a tree planting and long-term maintenance program that aims in planting a significant number of trees on an annual basis. Finally, Elysee considers complying with international renowned standards of tremendous importance. So far, we hold EMAS certification for production operations facilities and sales stores while we are certified by reputable organizations such as DVGW, WRAS, and KIWA. Also, we have acquired the ISO 14001:2015 and ISO 45001:2018.![our-journey-to-becoming-a-green-leader-3.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/our-journey-to-becoming-a-green-leader/our-journey-to-becoming-a-green-leader-3.jpg)

Elysée acknowledges that businesses have a tremendous impact on climate change and can contribute to the fight against it. For this reason, we are setting a strategic approach to monitor and evaluate our green performance, measure our environmental impact, and ultimately lead the way to a circular economy model. We plan to use forward-thinking practices for further investing in renewable energy and developing more circular products and technologies. This forms a testimony of our commitment to quality and towards the accomplishment of our goals for sustainability. Elysee has set a 10-year strategy, namely our mission Strategy50, in order to achieve our green vision by 2029, when the company turns 50 years old. For finding out more about the actions we take for fulfilling our aspiration of acquiring green leaders status, you can download our yearly report for 2021 here.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/our-journey-to-becoming-a-green-leader/our-journey-to-becoming-a-green-leader-1.jpg',
 'Elysée Group',
 '2022-11-30T12:00:00Z',
 4,
 true),
('elysee-hydraulic-fittings-collection',
 'Elysee’s Hydraulic Fittings Collection',
 'Elysee is a leading manufacturer and supplier of piping systems that also aspires to become a leading green company.',
 $md$Elysee is a leading manufacturer and supplier of piping systems that also aspires to become a leading green company. Currently, Elysee offers products and systems of the highest standards and ease of use to various sectors such as agriculture, landscape, building and infrastructure. The company’s Hydraulic Fittings Collection, which comprises threaded plastic accessories with both male and female type thread, is a top-quality range that offers a number of benefits.![hydraulic-fittings-range.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/elysee-hydraulic-fittings-collection/hydraulic-fittings-range.jpg)

The Hydraulic Fittings have great properties that render them trustworthy and reliable products. Specifically, the body of the fittings is made from black high-performance polypropylene copolymer PP-B while stainless steel is used for the reinforcing ring.

These materials enhance them with excellent long-term pressure, high impact resistance, as well as great chemical resistance when compared to other plastic materials. Due to their material, these products also guarantee great weathering properties that offer complete protection against degradation due to ultra-violet radiation. At the same time, they are perfectly safe to be used in potable water supply systems.

These fittings are suitable for working pressures up to 10 bar and 20oC for sizes up to 2” and 6 bar and 20oC for sizes 2 ½” up to 4”. Like all Elysee’s products, the Hydraulic Fittings collection complies with the requirements of important and respected international standards, specifically BS 21 and ISO 7, while they are manufactured in accordance with the company’s CYS EN ISO 9001:2015. It is important to note that the fittings provide precision BSP tapered threads that maximize sealing performance for ensuring leak tightness, thus optimum performance and durability. Notably, this comprehensive range includes plugs, bushes, nipples, sockets, tees, elbows, male/female reducers, and reducing nipples and sockets.![hydraulic-fittings-elysee.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/elysee-hydraulic-fittings-collection/hydraulic-fittings-elysee.jpg)

Elysee’s vision is to offer its customers a wide selection of the most reliable, high-quality, trustworthy products which, at the same time, are innovative, eco-friendly, easy to install, and corrosion-free. Simultaneously, Elysee strives to offer competitive prices without, however, compromising the quality of its products and systems. For this reason, our patented and award-winning products and hardware are designed, developed, and manufactured in Elysée’s in-house R&D facility while they undergo several thorough tests.

For finding out more, you can visit the company’s website and check any products or systems you are interested in. Alternatively, for more information on any matter or for discussing potential cooperation and partnership with us, you can contact Elysee’s friendly and knowledgeable team in contact us section who will promptly answer all your questions and meet your every requirement.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/elysee-hydraulic-fittings-collection/hydraulic-fittings-range.jpg',
 'Elysée Group',
 '2022-10-04T12:00:00Z',
 3,
 true),
('exposed-vs-concealed-plumbing',
 'Exposed vs Concealed Plumbing',
 'It goes without saying that plumbing plays a crucial role in the quality of any building, either residential or commercial.',
 $md$It goes without saying that plumbing plays a crucial role in the quality of any building, either residential or commercial. For this reason, one of the most important decisions you need to take during the construction phase of your house is whether you will use exposed or concealed plumbing. While many assume that having your plumbing system covered up and concealed is the obvious choice, there are, in fact, plenty of reasons to leave pipework exposed. This article will help you decide what is more beneficial, according to your own needs.![plumber-using-elysee-fittings.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/exposed-vs-concealed-plumbing/plumber-using-elysee-fittings.jpg)

The most popular factor that affects people’s decision into choosing concealed plumbing is aesthetic reasons. Undeniably, having concealed plumbing attributes a smooth and refined look to your home, unless you choose only a few, thin exposed pipes which, in that case, can even give a fashionable look to your space, for example, your bathroom. At the same time, with concealed plumbing, your house will definitely look cleaner as it is very difficult to clean thoroughly the entire pipes, especially the areas that cannot be easily reached and may gather lots of dust. However, the most important benefit of concealed pipes is that they are less prone to damage than the exposed ones since they are protected behind a thick wall unless there is some serious damage to the wall itself.

Exposed plumbing is more sensitive to weather damage as well as to natural and gradual deterioration over time. Nonetheless, when there is damage, the access to concealed pipes can be complicated and troublesome as the wall will probably have to be broken down for reaching the pipes. With exposed plumbing, even non-professionals can try and fix them, due to the fact that the picture of the damage is certainly clearer. This renders repairing potentially cheaper as you do not always require a professional to fix the problem but can experiment with DIY solutions, especially in the case of emergency repairs. Also, even if you eventually need to hire a professional, you won’t have the burden of repairing the wall and re-enclosing the pipes into it.

Overall, both solutions have advantages and disadvantages. What you need to do is decide which factors are more important to you and go with the type of plumbing that better suits your needs and taste. For finding more information and exploring various different pipe solutions for building and infrastructure, you can check our website.

Also, if you are interested in becoming a partnering company and joining our 65+ countries network, do not hesitate to contact us.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/exposed-vs-concealed-plumbing/plumber-using-elysee-fittings.jpg',
 'Elysée Group',
 '2022-08-09T12:00:00Z',
 3,
 true),
('water-saving-tips-for-your-landscape',
 'Water Saving Tips for your Landscape',
 'As widely known, although 70% of the Earth’s surface is water covered, there are numerous parts of the world that actually suffer from clean water shortage.',
 $md$As widely known, although 70% of the Earth’s surface is water-covered, there are numerous parts of the world that actually suffer from clean water shortage. This affects negatively our planet since water pollution is toxic to both humans and the environment. For this reason, we need to ensure that our landscape is not only beautiful and bountiful, but we also utilize water conservation methods.![elysee-water-saving-tips.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/water-saving-tips-for-your-landscape/elysee-water-saving-tips.jpg)

There are various simple and easy practices you can implement in order to have the landscape of your dreams while, simultaneously, you save water. Foremost, it is vital that you start the planting process early. In this way, your plants will need less water to be situated than they would require during warmer months. Also, when you are trying to decide on which plants to select, go for native and drought-resistance plants that need much less water and limited overall maintenance. Another tip to have in mind is to take advantage of the benefits that compost has as well as to cover the planting area with mulch. This prevents evaporation and helps the plant’s roots to preserve moisture.

Did you know that having a lawn in your garden requires an enormous amount of water for its preservation? It is better that you replace some of the areas covered in grass with a drought-resistant groundcover that does not require any mowing, and hence, you’ll manage to save plenty of water. What is also of great importance is to choose the right kind of sprinklers and use them only during morning hours as up to 1/3 of water may evaporate during the heat of the day. Another water-saving solution is to preserve and reuse greywater or rainwater. With the appropriate system, which can be also incorporated in your irrigation system, you’ll enhance irrigation performance and efficiency without any extra cost.

Finally, invest in a good drip irrigation system in order to make sure that your plants are watered right at the root. An irrigation system can save 20 to 50 % water usage in comparison to conventional pop-up sprinkler systems, and, effectively, save a significant amount of water. Make sure that you also get a timer in order to achieve maximum effectiveness and minimum waste.![elysee-water-saving-tips-2.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/water-saving-tips-for-your-landscape/elysee-water-saving-tips-2.jpg)

Elysee is committed to providing a great experience to all existing and prospective customers. For your landscape requirements, you can choose from a wide variety of products of the highest quality and which are easy to install, such as fittings, saddles, pipes, sprinklers, irrigation and micro-irrigation products. Notably, all products are eco-friendly and corrosion-free, patented and engineered in Elysée’s in-house R&D facility, which is precisely what gives the company an important competitive edge since it helps to focus on and develop improved water-saving technologies for their pipes and other products.

For more information, feel free to contact Elysee’s technical office team or visit our website to learn more about our innovative and smart products and find solutions to fulfill your every need and requirement.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/water-saving-tips-for-your-landscape/elysee-water-saving-tips.jpg',
 'Elysée Group',
 '2022-07-05T12:00:00Z',
 3,
 true),
('introducing-2-products-from-the-special-fittings-collection',
 'Introducing 2 products from the special fittings collection',
 'If you are looking for the most effective way to connect polyethylene pipes to various kinds of plumbing materials, Elysee has developed two products of the highest quality, designed to seal pipes of…',
 $md$If you are looking for the most effective way to connect polyethylene pipes to various kinds of plumbing materials, Elysee has developed two products of the highest quality, designed to seal pipes of various kinds of materials and diameters. These are the **Universal Adaptor** and the **Global Transition Coupling**, which are both available in various sizes to suit your different needs.![universal.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/introducing-2-products-from-the-special-fittings-collection/universal.jpg)

The **Universal Adaptor** has been tested and approved by leading certification bodies, such as DVGW, KIWA, WRAS, and BV, while the entire range of our mechanical compression fittings are certified with internationally renowned standards, like for example, ISO 14236, EN 12201, and DIN 8076. Furthermore, this product complies with various dimensional requirements and characteristics of important standards, including ISO 14236 and EN 1092. At the same time, all fittings fully comply with hygiene and sanitary requirements, as specified by international standards, such as BS6920, KTW, and AUS/NZ 4020. Importantly, these fittings can be used with working pressure up to 6 bars at 20oC. Due to the materials used for their manufacturing, the universal adaptor fittings can be utilized on exposed systems without requiring extra protection, as they have excellent impact and weathering properties, enhanced with ultraviolet radiation that offers complete protection against degradation. Notably, this product is ideal for connecting polyethylene pipes to copper pipes while it is available in various sizes: Ø 20 x 15, Ø 25 x 15, Ø 25 x 22, Ø 32 x 22, and Ø 32 x 28.![global.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/introducing-2-products-from-the-special-fittings-collection/global.jpg)

The **Global Transition** Coupling fitting is another top-quality product that the company offers to its customers. As part of Elysee’s quality management system, that is, ISO 9001:2008 - approved by CCC and IQNet, the company’s fittings have received respectable and prestigious certifications of all related standards, including ISO 17885, EN 12201, DIN 8076, and AS/NZ 4129. Simultaneously, as we follow international hygiene sanitary requirements, the fittings fully conform with the same standards as the universal adaptor fittings. Importantly, the global transition coupling fittings can safely transport abrasive slurries while withstanding normal conditions such as the ones encountered in urban, mining, industrial, rural and waste water systems, while their maximum working pressure is 10 bars at 20oC. Notably, with this product, you can connect polyethylene pipes to pipes of various diameters and different metal and plastic materials, which are copper, galvanized iron, lead, PVC, stainless steel, and it is available in different sizes: Ø 15-22 x 20, Ø 15-22 x 25, Ø20-27 x 25, Ø 20-27 x 32, Ø 27x34 x 25, and Ø 27-34 x 32.![global-connections.JPG](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/introducing-2-products-from-the-special-fittings-collection/global-connections.JPG)

We guarantee that meticulous testing is done on both types of fittings that are described above, such as that of the raw material (MRS value), the melt mass flow rate (MFR), and the internal pressure of the fitting’s body, and of the fitting fixed with PE-pipes. What’s more, a pull-out test of the fittings connected with PE pipes is performed. We find it of vital importance to ensure leak tightness against low pressure and bending so we perform all necessary checks. Finally, due to the fact that hygiene is one of our prime concerns, we conduct careful testing of the fitting’s body and sealing ring.

Elysee is committed to offering to its customers a wide selection of the most reliable, high quality, and trustworthy products that are eco-friendly, easy to install, and corrosion-free. For this reason, our patented and award-winning products and hardware are designed, developed, and manufactured in Elysée’s in-house R&D facility. For more information or advice on the company’s products, you can contact Elysee’s technical office team at here.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/introducing-2-products-from-the-special-fittings-collection/universal-global.jpg',
 'Elysée Group',
 '2022-06-07T12:00:00Z',
 4,
 true),
('discover-the-zeeflex-fittings-collection',
 'Discover the ZEEFLEX fittings collection',
 'For effectively connecting flexible PVC hoses that are used in swimming pool installations, Elysee has developed the top quality ZEEFLEX Compression Fittings.',
 $md$For effectively connecting flexible PVC hoses that are used in swimming pool installations, Elysee has developed the top-quality ZEEFLEX Compression Fittings. The fittings are the result of thorough testing and development by the Research and Development Department of the company, which ensures each product’s optimum design, function, and operation.![zeeflex.png](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/discover-the-zeeflex-fittings-collection/zeeflex.png)

The ZEEFLEX Compression Fittings have great properties and constitute the most trustworthy products to be used with 50&63 mm flexible PVC pool hoses. Specifically, they comply with the dimensional requirements and characteristics of various relevant standards such as EN 712, 713, 911, ISO 34 58/3501, and DIN 8076. Conveniently, the fittings can be operated with working pressures of up to 6 bars at 20 ⁰C while the spiral pipe can withstand temperatures of up to 50 ⁰C. They have an extensive use with various fluids, in addition to water, due to their high chemical resistance, and they are even suitable for transporting abrasive slurries while withstanding normal conditions, like for example those found in urban, mining, industrial, rural water, and waste water systems. Likewise to all Elysee products, these fittings are made with the most high-quality materials. Specifically, due to their non-magnetizing properties, there is no risk for electrolytic deterioration. In addition, the thermoplastic materials used for their manufacturing provides them with excellent impact and weathering properties, enhanced with ultraviolet radiation that offers complete protection against degradation. We cannot stress enough that meticulous testing is constantly being performed on our fittings, which includes that of raw material (MRS value), internal pressure of the fittings’ body and of the fitting fixed with PE-pipes. Moreover, a pull-out test of the fittings connected with PE-pipes is done. What is also of vital importance is that leak tightness against low pressure and bending is ensured with the appropriate checks as well as the melt mass flow rate. Finally, hygiene is also one of our prime concerns, hence, we conduct careful testing of the fitting’s body and sealing ring.

Each component of the fittings has its own specific purpose for having the most effective and reliable function. The most important fitting component is, of course, its body, which has the ability of being shaped in various dimensions and configurations, according the fluid’s direction. The body is made from either black high-performance polypropylene copolymer PP-B or PVC, materials that endorse the fitting with higher impact resistance qualities, in comparison to other plastic materials, ensuring long-term pressure resistance. Within the fitting system, a nut is positioned, which is externally connected to the body by a male trapezoidal thread. Also, the female trapezoidal thread that is internally applied enables an easy connection of the nut with the fitting body. The material used for this component is black high-performance polypropylene copolymer PP-B, and it has an ergonomic design that makes handling during assembly with a pipe easy and simple. The same material is also used for the insert that secures the o-ring (a component that guarantees leak tightness between the fitting system and the inserted pipe) during handling and operation. The material chosen for the o-ring is EPDM and Nitrile rubber (NBR 70), which allows it to withstand high service temperature and have high compression set, tear, and abrasion resistance. For achieving the most effective grip between the fitting system and all kinds of polyethylene pipes, there is a split ring, made from high-performance polyacetal material and a mixture of nylon with fiberglass 30%, that provides the optimum high-end load resistance. The design of this component, with conical ribs externally and sharp triangular teeth internally, guarantees excellent function.![zeeflex-assembly.png](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/discover-the-zeeflex-fittings-collection/zeeflex-assembly.png)

Elysee vows to offer to its customers a large selection of the most reliable, high quality, and trustworthy products that are eco-friendly, easy-to-install, and corrosion-free. This is why all products and hardware, which are patented and award-winning, are designed, developed, and manufactured in Elysée’s in-house R&D facility.

For more information or advice on the company’s solutions, you can contact Elysee’s technical office team that will promptly answer all your questions and meet your every requirement.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/discover-the-zeeflex-fittings-collection/zeeflex.png',
 'Elysée Group',
 '2022-05-03T12:00:00Z',
 4,
 true),
('irrigation-in-line-filters-for-maximum-efficiency',
 'Irrigation In-Line Filters for Maximum Efficiency',
 'Elysee’s motivating force has always been business driven innovation and continuous improvement.',
 $md$Elysee’s motivating force has always been business-driven innovation and continuous improvement. Due to this, all products are developed in the company’s in-house R&D department, whose main task is to maximize durability, usability, and ease of installation for achieving the greatest water management. For protecting your drip irrigation systems, in both residential and commercial installations, you need to select the appropriate filter. Fortunately, Elysee has got you covered with two types of irrigation filters that will enable you to attain maximum efficiency: **disc** and **screen**.![in-line-filters-elysee-JuIA8.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/irrigation-in-line-filters-for-maximum-efficiency/in-line-filters-elysee-JuIA8.jpg)

Elysee prides in their extensive filter collections that are the result of extensive and thorough research from their in-house R&D Department. In general, the company’s filters come in three categories: screen, disc and metal filters. However, in this article, we will be focusing on 2 solutions: screen and disc filters. Elysee’s screen filters, come in different sizes and diameters (ø) and with different properties (standard, with mini valve, and with plug). On the other hand, the disc filter series consists of 2 standard versions and one vertical with diameter options from Ø ¾" to 3".

On the one side, Elysee’s In-Line Screen Filters form an optimal choice. The flow direction of the In-Line Screen Filters is from inside the screen to the outside so that most impure suspended solids accumulate at the lower end of the filter. The lid can then be easily unscrewed and removed from the main body, as well as the INOX-made screen from the housing, in order to be manually rinsed. What is also useful is that the screen elements are specifically designed for separating inorganic particles, ensuring in this way a very low head loss. For safeguarding the sealing inside the filter housing, the filters include two O-rings that are incorporated in the cylinder. At the same time, the different filtration degrees are color-coded for more convenience. Notably, the filters can withstand a maximum pressure of 8 bar at 20 _°_C, with a nominal flow rate of 5 m3/ h or 10 m3/ h, according to the filter of your choice.![screen-filter-CWngL.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/irrigation-in-line-filters-for-maximum-efficiency/screen-filter-CWngL.jpg)

Likewise, the In-Line Disc Filters constitute a high-quality product with great protective qualities. These filters are arranged for flow that passes from the outside of the cartridge inwards, in order to accumulate suspended solids on the outside surface of the discs’ cartridge. Similarly, to the Screen Filters, it is very easy to remove and manually clean the cartridge, simply by unscrewing the lid from the main body. What is more, the Polypropylene discs are specially designed for separating inorganic particles, in order to guarantee the lowest possible amount of energy lost from the resistance to flow.

The company’s In-Line Screen and Disc Filters constitute the ideal solution for agriculture and gardening installations, in order to protect emitting devices and pipes, such as driplines, sprinklers, micro-sprinklers, and emitters. Due to their material, which is glass-reinforced propylene, they have great resistance to time, sunlight and chemicals, rendering them suitable for removing many types of contaminants, including sand and organic particles. Notably, all Elysee’s products are suitable for potable water supply systems, while approved raw materials that go through laboratory tests, such as KTW and BS 6920, are used for their manufacturing.![filter-with-plug.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/irrigation-in-line-filters-for-maximum-efficiency/filter-with-plug.jpg)

Polypropylene is a very popular material with many applications in the injection molding industry, including the agricultural sector. This is because of a number of benefits that come with its use. Foremost, it is a cost-effective material that is very resistant to both water and various chemicals. Furthermore, it possesses high flexural strength because of its semi-crystalline nature and has good impact strength and resistance. These factors contribute to its popularity as they guarantee durable and reliable products that are easily repaired from damage. What is also important for companies that care about the environment and promote green thinking is that it can be recycled, rendering it an environmentally friendly material that can be reused.

When you buy from Elysee, you don’t have to worry about the high standards of your products since this is of paramount importance for the company. To achieve the best quality, the company performs several test fittings in their well-equipped testing room, run by their in-house R&D department that is comprised of qualified and trusted staff. To this end, the company is devoted to providing its customers with reliable, patented, and award-winning products so as to cover their every need with regard to the management of water.

For more information, feel free to contact Elysee’s experienced team that can offer more tips and targeted advice on the most reliable, world-class piping systems and hardware here

Alternatively, you can browse through our variety of products and check their specifications in the products section$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/irrigation-in-line-filters-for-maximum-efficiency/in-line-filters-elysee-JuIA8.jpg',
 'Elysée Group',
 '2022-04-07T12:00:00Z',
 4,
 true),
('zeta-series-compression-fittings',
 'Presenting Zeta Series compression fittings by Elysee',
 'Compression fittings form the optimum solution for connecting metal or hard plastic tubing due to the fact that they can withstand great pressure, high temperatures, and are compatible with various…',
 $md$![zeta-series.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/zeta-series-compression-fittings/zeta-series.jpg)

Compression fittings form the optimum solution for connecting metal or hard plastic tubing due to the fact that they can withstand great pressure, high temperatures, and are compatible with various different -even aggressive- fluids. They have a diverse usage and can be found in several facilities, such as gas lines, in refineries, and within residential plumbing systems. This article aims to provide readers with important information on the Zeta Series, which can be used in cold water services.

The series comes in 3 categories of products: 1) High Tolerance (20mm-32mm), 2) Leap Seal (40mm-63mm), and 3) Zero force (75mm-110mm).

**Why choose Zeta Series Compression Fittings**

Importantly, Elysee’s basic range of compression fittings, including its Zeta Series, has been tested and certified by leading international bodies such as DVGW, KIWA, and WRAS. The company’s fittings can safely join high and low-density polyethylene pipes with various external diameters, conforming to notable certifications like EN12201, BS1972 (for high tolerance), and ISO17885. Hence, the same fitting can be installed on pipes as defined by several standards, including the aforementioned. Elysee always ensures that its products and fittings fully comply with international hygiene and sanitary requirements, including the ones specified by BS6920. Due to this, its compression fittings constitute the ideal solution for conveying potable water and other fluids which are meant for human consumption.

What is also noteworthy is that Elysee’s Zeta Series Compression Fittings, because of the thermoplastic materials used for their manufacturing, have great impact properties and can be used for transporting fluids, gaseous fuels, compressed air, chemicals solutions, and abrasive slurries under high pressure. Also, the fittings are able to withstand normal conditions, such as the ones found in urban, mining, industrial, rural water, and wastewater systems. What is more, Elysee’s Zeta compression fittings can be used on exposed systems without requiring any additional protection because of the ultra-violet radiation which endorses them with excellent weather properties. Overall, your purchases' quality is undoubtedly of the highest standards.![zeta-series-fitting.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/zeta-series-compression-fittings/zeta-series-fitting.jpg)

Along with their lightweight, ergonomic, modern, and easy-fit design, the Zeta Series -Range fittings aim to decrease alterations as much as possible while **they do not require force for the pipe’s installation.** This is due to a number of factors that were taken into consideration for the fittings’ design and unique shape. Specifically, the body of these products is made of top quality and certified raw materials in order to offer long-term and high impact resistance. At the same time, Elysee’s Zeta Series fittings have a rubber seal made by EPDM70 that allows them to withstand high service temperature, excellent compression set and tear, ensuring in this way an extensive lifespan. Simultaneously, the seal keeps the fitting system and the inserted pipe well connected for the most effective leak tightness. The split ring, made of high-performance polyacetal material, has optimum stiffness and hardness for withstanding high-end load resistance, enabling it to join all types of polyethylene pipes. Finally, the split ring and the nut make sure that the pipe cannot be pulled out, even when maximum force is applied, guaranteeing a proven leak-free secured system.

Elysee is a leading sustainable world supplier in piping systems that offers its customers a wide selection of the most reliable and trustworthy products. Notably, all your purchases are of the highest quality and, simultaneously, they are easy-to-install, eco-friendly, and corrosion-free. This is proven by the fact that the company produces patented and award-winning products and hardware that are designed, developed, and manufactured in Elysée’s in-house R&D facility.

Elysee vows to provide a great experience to all existing and potential customers. For targeted advice on the most reliable, world-class piping systems and hardware, contact Elysee’s technical office team that will immediately answer all your questions in order to satisfy your needs and requirements.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/zeta-series-compression-fittings/zeta-series.jpg',
 'Elysée Group',
 '2022-03-08T12:00:00Z',
 4,
 true),
('omicron-series-important-things-to-know-about-our-top-class-compression-fittings-push-fit',
 'Omicron Series (Push-fit): Important things to know',
 'This article aims to provide readers with important information on the Omicron Series (Push Fit), from Elysee’s comprehensive range of top class mechanical compression fittings.',
 $md$![omicron-series-ph1.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/omicron-series-important-things-to-know-about-our-top-class-compression-fittings-push-fit/omicron-series-ph1.jpg)

This article aims to provide readers with important information on the Omicron Series (Push-Fit), from Elysee’s comprehensive range of top-class mechanical compression fittings.

They are ideal for connecting metal or hard plastic tubing since they can withstand great pressure, high temperatures, and handle various different fluids. They can be used in several facilities, including gas lines in refineries and within a home’s plumbing system.

One of their most important features is that they are ideal for the conveyance of fluids, gaseous fuels, compressed air, chemical solutions, and slurries. At the same time, they can be used for the transference of potable water and fluids which are perfectly safe for human consumption.

Elysee’s Push-Fit series provides a wide range of innovative compression fittings, for sizes 20mm 25mm, and 32 mm, which can be easily installed with an easy push in order to connect to metrical Polyethylene pipes.

Notably, Elysee’s complete range of these fittings has been tested and approved by all leading local and international certification bodies, such as DVGW, KIWA, WRAS, and BV. What’s more, they have acquired trusted product certifications, including ISO 17885, EN 12201, for their high standards and top quality materials. Elysee, by constantly testing its products, ensures that all health and safety features fully conform to important hygiene and sanitary requirements as provided by leading bodies, for example, BS69020, KTW, and AUS/NZ 4020.![omicron-series-ph2.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/omicron-series-important-things-to-know-about-our-top-class-compression-fittings-push-fit/omicron-series-ph2.jpg)

Elysee not only offers a diverse variety of products but also of top-class quality with an ergonomic, unbreakable, and corrosion resistant design. Furthermore, due to their lightweight and easy-fit structure, they are the most appropriate solution for emergency situations and limited space applications. Combined with their high chemical and impact resistance, the Omicron Push-Fit series guarantees an extensive lifespan before requiring replacement or major repair, if however, the products are maintained properly and are used under normal operating conditions. However, it is very easy to keep them safe as they have excellent impact and weathering properties.

Notably, the body of the compression fittings is shaped in several dimensions and configurations so that that the requirements and arrangements of the fluid’s direction are effectively met. Crucially, the fittings are fully protected against degradation, due to UV radiation. Also, they are suitable for working pressures and can withstand really high pressures of up to 16 bar at 20°C. Specifically, the fitting’s O-Ring is made of Nitrile rubber that keeps the fitting system and the inserted pipe well connected for the most effective leak tightness against low pressure and under bending while withstanding high service temperature, excellent compression set, and tear. In other words, these products are enhanced with a proven leak-free system that provides them with outstanding sealing abilities.

Elysee is a leading sustainable world supplier in piping systems that offers a large selection of the most reliable products and of the highest quality. All Elysee’s products are not only easy-to-install but also eco-friendly and corrosion-free. What is also important to note is that all hardware is designed, developed, and manufactured in Elysée’s in-house R&D facility, which is precisely why the company can provide its customers with patented and award-winning products.

Elysee vows to provide a great experience to all customers. For more tips and targeted advice on the most reliable, world-class piping systems and hardware, please contact Elysee’s technical office team that will fulfill your every need.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/omicron-series-important-things-to-know-about-our-top-class-compression-fittings-push-fit/omicron-series-ph1.jpg',
 'Elysée Group',
 '2022-02-02T12:00:00Z',
 3,
 true),
('lambda-series-things-to-know-about-our-top-class-compression-fittings',
 'Lambda Series: Things to know about our top-class compression fittings',
 'Compression fittings are ideal for connecting metal or hard plastic tubing since they can withstand great pressure, high temperatures, and handle various different fluids.',
 $md$Compression fittings are ideal for connecting metal or hard plastic tubing since they can withstand great pressure, high temperatures, and handle various different fluids. They can be used in several facilities, including gas lines in refineries and within a home’s plumbing system This article aims to provide readers with important information on the Lambda Series PN10 (Metric PN10 bar), from Elysee’s comprehensive range of top-class mechanical compression fittings. The Lambda Series PN10 offers a complete range of fittings which are available in a full range of sizes, from 20mm up to 63mm.![compression-fittings-pn10-a.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/lambda-series-things-to-know-about-our-top-class-compression-fittings/compression-fittings-pn10-a.jpg)

Notably, the fittings are specifically designed to easily convey a variety of fluids, gaseous fuels, compressed air while they are particularly resistant to high chemical solutions and abrasive slurries. What is also important to note is that, because of ultra-violet radiation, they offer excellent weather properties and can be used on exposed systems without risking degradation.

Furthermore, due to the fact that these products comply with both national and international health and safety standards, they are ideal for the safe transfer of potable water and fluids, which are even intended for human consumption. The quality of the compression fittings is guaranteed through the use of top quality and certified raw materials that render them unbreakable and, also, resistant to corrosion, thus, able to be used in several situations and for limited space applications. Elysee is dedicated to providing high-quality products, hence, everything is regularly inspected, tested, and approved by the main international testing institutes and certification bodies, such as CCC and IQNet. Due to this, every single product you buy is meant for extended use and has an extensive lifespan.![compression-fittings-pn10-b.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/lambda-series-things-to-know-about-our-top-class-compression-fittings/compression-fittings-pn10-b.jpg)

What marks this particular line as particularly useful is its ability to securely withstand longer high pressure, ensured by the internal pressure test of the fittings fixed with PE-pipes. Notably, the body of the fitting system can be shaped in various dimensions and configurations for adapting easily to the fluid’s directions. At the same time, Elysee’s Lambda Series fittings have an O-Ring made of Nitrile rubber that keeps the fitting system and the inserted pipe well connected for the most effective leak tightness against low pressure and under bending while withstanding high service temperature, excellent compression set, and tear. In other words, these products are enhanced with a proven leak-free system that provides them with outstanding sealing abilities. Along with their lightweight, ergonomic and easy-fit design, and the fact that they are made by high-performance polypropylene copolymer PP-B, they constitute a product you can definitely rely on.

Elysee is a leading sustainable world supplier in piping systems that offers a wide selection of the most reliable products and of the highest quality that are easy-to-install, eco-friendly, and corrosion-free. Notably, the company offers to its customers patented and award-winning products since all hardware is designed, developed, and manufactured in Elysée’s in-house R&D facility.

Elysee vows to provide a great experience to all customers. For more tips and targeted advice on the most reliable, world-class piping systems and hardware, feel free to contact Elysee’s technical office team that will satisfy your needs and answer your queries promptly and effectively.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/lambda-series-things-to-know-about-our-top-class-compression-fittings/compression-fittings-pn10.jpg',
 'Elysée Group',
 '2022-01-03T12:00:00Z',
 3,
 true),
('epsilon-series-things-to-know-about-our-top-class-compression-fittings',
 'Epsilon Series: Things to know about our top-class compression fittings',
 'Compression fittings constitute the optimum solution for connecting metal or hard plastic tubing.',
 $md$Compression fittings constitute the optimum solution for connecting metal or hard plastic tubing. What makes them so useful is that they can withstand high pressures, operating temperatures, and are compatible with various different fluids, even aggressive ones. They have a wide range of use, from industrial usage to home plumbing applications. This article aims to provide readers with important information on the Epsilon Series fittings (Metric PN16 bar), from Elysee’s comprehensive range of top-class mechanical compression fittings.![epsilon-series-1.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/epsilon-series-things-to-know-about-our-top-class-compression-fittings/epsilon-series-1.jpg)

While product diversity is certainly important, quality also holds a central role when trying to decide on the right purchase. Elysee not only has a great variety of top-class of compression fittings, including its wide selection of Epsilon Series, but these are regularly tested (both in in-house facilities and in external accredited laboratories) and certified for their high quality, at a global and local level, in several countries. All mechanical compressions fittings comply with the appropriate national and international standards and are approved by leading certification bodies. At the same time, Elysee monitors all production stages, from the selection of raw materials to the delivery of the end-product to the customer, for ensuring a best-rated quality.

Elysee’s mechanical compression fittings are specifically designed for the purpose of securely conveying various fluids, gaseous fuels, compressed air, chemical solutions and slurries, not only safely but under high pressure too. Epsilon Series fitting bodies, in particular, are extensively tested according to International, European and local standards whereas applicable. These test procedures constitute by very-high pressure (2.5 times the operating pressure testing), extreme pull-out forces, and numerous batch release and type tests. Since the fittings are also used for the conveyance of fluids other than water, it is important to note that they have great chemical resistance. At the same time, they can be used for the safe transference of fluids that are meant for human consumption, therefore several standards and regulations concerning hygiene and sanitary requirements comply. Epsilon series products have a life expectancy of around 50 years is granted before needing replacement or a major repair, if they are used, however, under normal operating conditions.![epsilon-series-2.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/epsilon-series-things-to-know-about-our-top-class-compression-fittings/epsilon-series-2.jpg)

Crucially, all Epsilon Series compression fittings are made by polypropylene thermoplastic material, which has a natural thermal insulation that is significantly higher than copper and steel, 2000 and 200 times more, respectively. Also, plastic fittings are non-magnetizing, which means that electrolytic corrosion is prevented. Notably, since the fitting is all black, made with a high-performance polypropylene PP-B material, it does not transmit light while, thus protecting the water quality in potable water pipelines against the growth of microorganisms, therefore the quality of potable water is guaranteed. Specifically, the body of the Epsilon Series compression fittings is shaped in several dimensions and configurations, in order to meet all requirements and arrangements of the fluid’s direction. There is also another component, an O-ring, that is specifically designed to prevent any leakiness between the fitting system and the inserted pipe, made with high-quality Nitrile rubber for attaining maximum efficiency. Moreover, the split ring allows optimum grip between the two aforementioned components, which adds to the fitting’s resistibility and performance.![epsilon-series-3.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/epsilon-series-things-to-know-about-our-top-class-compression-fittings/epsilon-series-3.jpg)

Overall, Elysee, as a leading sustainable world supplier in piping systems, offers a large selection of the most reliable products and of the highest quality that are easy-to-install, eco-friendly, and corrosion-free. Notably, all hardware is designed, developed in Elysée’s in-house R&D facility, which is why the company can supply its customers with patented and award-winning products.

Elysee vows to provide a great experience to all customers. For more tips and targeted advice on the most reliable, world-class piping systems and hardware, feel free to contact Elysee’s technical office team that will cater your needs in the best possible way.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/epsilon-series-things-to-know-about-our-top-class-compression-fittings/epsilon-series-1.jpg',
 'Elysée Group',
 '2021-12-09T12:00:00Z',
 4,
 true),
('things-to-know-about-our-top-class-saddle-fittings',
 'Things to know about our top-class Saddle fittings',
 'If you want to run an additional water supply line from an existing pipe for a home appliance, such as a refrigerator ice maker, a water dispenser, or a humidifier, then saddle fittings provide the…',
 $md$If you want to run an additional water supply line from an existing pipe for a home appliance, such as a refrigerator ice maker, a water dispenser, or a humidifier, then saddle fittings provide the optimal solution. Saddles have a specific shape that allows them to mount directly on the host water pipe in order to supply water or other fluids from the main line, usually of low volume and pressure.![saddles-1.png](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/things-to-know-about-our-top-class-saddle-fittings/saddles-1.png)

Elysee has a wide range of top-class saddles, which are suitable for secondary line derivation from main lines of PP, PE or PVC for irrigation and can be used in potable and irrigation water supply systems. Elysee’s saddles, due to their high chemical resistance, are able to convey a wide variety of fluids, other than water. Notably, the saddles have excellent abrasion resistance and can be securely used for the reliable transportation of abrasive slurries, in normal conditions, usually found in urban, rural, mining, and industrial waste water systems. Since the body of the saddle can be shaped in various dimensions and configurations, the optimal handling of the fluids’ direction is allowed. What is more, they can handle a high-pressure conveyance of water, delivering efficient and secure water management.

Elysee’s products are specially designed to offer a secure and easy installation. In addition to their simple installation, they are also reliable in terms of durability, due to their high-grade polypropylene material. Also, the saddles’ top-quality nitrile sealing gasket ensures a secure, leak-free fitting that enhances both their operation and pressure resistance. The saddles’ thermoplastic materials have impact resistance so they can withstand intense force without the risk of deformation. At the same time, due to the fact that the saddle fittings are not magnetizing, electrolytic deterioration is prevented. Thus, an excellent and long-lasting performance, under the most demanding conditions, is ensured.![saddles-2.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/things-to-know-about-our-top-class-saddle-fittings/saddles-2.jpg)

When you choose to buy from Elysee, you won’t have any concerns about the quality of your products since this has been one of the company’s top priorities from the start. To this end, the company performs several test fittings in their well-equipped testing room, run by qualified and devoted staff, so that the high quality of their products is guaranteed. Elysee's saddles, in particular, showed great resistance to long-term internal hydrostatic pressure. One of the saddles’ main features is its axial and radial teeth which allow the saddle to withstand rotational and axial sliding on the pipe. Furthermore, the axial and radial protrusion ribs offer greater strength and performance.

Overall, Elysee has a variety of the most reliable, world-class piping systems and hardware of the highest quality that are easy-to-install, eco-friendly, and corrosion-free. Notably, all hardware is designed, developed, and manufactured in Elysée’s in-house R&D facility, which is why the company can supply its customer with patented and award-winning products.![saddles-3.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/things-to-know-about-our-top-class-saddle-fittings/saddles-3.jpg)

Elysee vows to provide a great experience to all customers. For more tips and targeted advice on the most reliable, world-class piping systems and hardware, feel free to contact Elysee’s technical office team that will cater to your needs in the best possible way.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/things-to-know-about-our-top-class-saddle-fittings/saddles-1.png',
 'Elysée Group',
 '2021-11-12T12:00:00Z',
 3,
 true),
('7-things-to-know-about-pp-and-pvc-ball-valves',
 '7 things to know about PP and PVC Ball Valves',
 'PP and PVC Ball Valves are durable, cost \ effective, and used for a wide variety of applications, such as to regulate, control, direct, and modulate the flow and pressure of fluids.',
 $md$**PP and PVC Ball Valves** are durable, cost**\-**effective, and used for a wide variety of applications, such as to **regulate**, **control**, **direct**, **and modulate the flow and pressure of fluids.** ​This article aims to provide readers with important information on two types of ball valves: PP and PVC.![ball-valves.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/7-things-to-know-about-pp-and-pvc-ball-valves/ball-valves.jpg)

**PVC ball valves** offer plenty of benefits, for both **residential and commercial uses**. First of all, they guarantee an **excellent water flow**, hence, they are perfect for being used in various different water applications, such as in potable water, irrigation, water treatment and wastewater, landscaping, pool, pond, etc. What is also important is that they are cost-effective, making them accessible to anyone. **PVC ball valves** have an excellent resistance function and can handle **working pressures** up to 16 bars at 20C, unlike PP ball valves which are suitable for working pressures up to 10 bars. Furthermore, their ergonomic designed surface, **lightweight** yet rugged, and **rust-proof** material, along with the removable handle ensures an easy installation, handling, and gripping. Notably, as all Elysee’s products, they conform to international hygiene and sanitary requirements, such as the British Standards criteria, meaning that they guarantee long-term quality assurance.![pvc-ball-valves.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/7-things-to-know-about-pp-and-pvc-ball-valves/pvc-ball-valves.jpg)

Likewise, PP ball valves, due to their high-quality polypropylene material, have a great performance and cover most flow control needs, often with many years of operation. At the same time, this material is considered as more environmentally friendly than other materials used for such purposes. If you choose a PP ball valve, an **excellent water flow** with minimal pressure drop is ensured and, of course, high durability. Needless to say, these are of superior quality, with certified injection-molded plastic bodies and components, according to EN 12201-3 and ISO 17885 standards. Similar to PVC ball valves, they also have various different **industrial**, **agricultural**, and **domestic applications**.![pp-ball-valves.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/7-things-to-know-about-pp-and-pvc-ball-valves/pp-ball-valves.jpg)

All of **Elysee’s PP and PVC ball valves**, made of **durable** material against degradation, are able to withstand most weather conditions and can be exposed to sunlight, due to ultra-violet radiation. Simultaneously, they have **great chemical resistance** to most solutions, such as those of acids, alkalis, and salts, therefore, they require no further protection. Moreover, for the right process application, valve actuation allows full traceability. Finally, due to the strong, versatile, durable, and **robust construction**, they are suitable **for** both **interior and exterior usage**, promising many years of reliable and consistent operation with little maintenance.

Elysee has an **excellent quality system**, approved by CCC and IQNet. Because all hardware, which is patented and award-winning, is designed, developed, and **manufactured by Elysee’s in-house R&D team**, you won’t have to worry the least about the quality and durability of your purchases.

For learning more about Elysee ball valves and other products, feel free to **contact our experienced team** and friendly and knowledgeable staff to give you tailored solutions and targeted advice on the most reliable, **world-class piping systems and hardware**. Elysee prioritizes making **innovative solutions** that meet every customer’s individual needs in order to make their lives easier.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/7-things-to-know-about-pp-and-pvc-ball-valves/ball-valves.jpg',
 'Elysée Group',
 '2021-10-07T12:00:00Z',
 3,
 true),
('6-things-to-know-about-landscape-irrigation-design',
 '6 things to know about landscape irrigation design',
 'This article aims to provide readers with important tips and advice on the best practices to use when designing an efficient irrigation project, no matter the size of the garden.',
 $md$This article aims to provide readers with important tips and advice on the best practices to use when **designing an efficient irrigation project**, no matter the size of the **garden**. By integrating certain irrigation solutions and ergonomic products, your garden’s needs can be catered while the results will be truly stunning.

**1\. Identify the water source**

What is of great importance is to identify the **water source** to the irrigation system since **landscape design** and planning depends largely on hydraulics. For this reason, you should be able to know where the water comes from and, also, the flow rate. To explain further, you should know how much water is available per minute and the water pipe’s size since it determines the water’s speed and pressure.![landscape-man-working-on-a-garden.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/6-things-to-know-about-landscape-irrigation-design/landscape-man-working-on-a-garden.jpg)

**2\. Address the coverage area**

A **uniform distribution of water** is also vital in order for all areas to be properly and consistently irrigated. Thus, the **irrigation** placement should be done in a way that covers many shapes and sizes, for **all areas to be evenly irrigated**. This can be ensured with each **sprinkler** head to be adjusted with various different nozzles so that there is a “head-to-head coverage”.

**3.Know your plants and the topography**

Whether you want to irrigate a small private **residential** property or a large **commercial** one, you should definitely know what **type of plants** are going to be irrigated. This is crucial for deciding how much water is necessary. Also, the **soil texture** is another factor to consider; different textures require more or less water so the more information is available the more effective and efficient the landscape irrigation design will be.

**4.Plan your irrigation placement**

What you should also have in mind is that **irrigation design** should have proper zoning. Specifically, plants and turfs should not be placed together since their water needs are vastly different. While turf requires 1” of precipitation on a weekly basis, **plants have various needs**, according to each species. What will be definitely catastrophic is to water them all together since their needs and requirements need to be addressed individually.

**5.Ensure proper zoning**

For **proper zoning** to be succeeded, pipe routing should be properly placed, with the appropriate hydraulics, so that the irrigation system can bring water to all zones. Notably, **Elysee’s** innovative products and irrigation systems are **flexible and expandable** to accommodate growing demands.

**6.Have the right tools**

Finally, you need to have the right tools, according to your own project, budget, and preference. Elysee has a variety of different irrigation products and solutions, with many benefits, including **water and cost\-efficient solutions**, which are suitable for both residential and commercial use. At the same time, you can find bespoke and innovative products with **flexible design** and of the **highest quality** that are easy-to-install, eco-friendly, and corrosion-free. Notably, everything is patented and engineered in Elysée’s in-house R&D facility.

For comprehensive information on **landscape design** and irrigation solutions, you can **download Elysee’s free guidebook**, which covers, among others, modern **landscape irrigation** strategies, tips, techniques, and hardware.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/6-things-to-know-about-landscape-irrigation-design/landscape-man-working-on-a-garden.jpg',
 'Elysée Group',
 '2021-08-09T12:00:00Z',
 3,
 true),
('why-precision-irrigation-is-the-only-way-to-sustainable-agriculture',
 'Why precision irrigation is the only way to sustainable agriculture',
 'If you are a farmer or work in the agriculture industry, it is important to know the benefits of using precision irrigation, and how the right choices can help not only farmers but also the…',
 $md$If you are a farmer or work in the **agriculture industry**, it is important to know the benefits of using **precision irrigation**, and how the right choices can help not only farmers but also the environment.![irrigation-a-farmer-is-checking-the-plants.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/why-precision-irrigation-is-the-only-way-to-sustainable-agriculture/irrigation-a-farmer-is-checking-the-plants.jpg)

Due to the fact that **water**, albeit a natural resource, is difficult to secure for land irrigation purposes, mostly due to climate changes and its rising price, implementing **precision irrigation** practices in the agriculture industry is as vital as ever. Precision irrigation refers to watering the **roots** of the plants and not the soil, when and where is required by the plants, and, also, in the required quantity. **Drip irrigation** is the most efficient system for watering your plants exactly as they need to. Since a low-pressure system directs a steady and **consistent water flow**, the plants get the nutrients they need uniformly while this is the most **cost-effective** solution, saving water and labour needs, reducing the use of chemicals and energy, maximising in this way yields and profits.

Due to the limited resources in terms of arable land, as well as other socio-political and environmental issues, those who work within the agriculture sector should practice **sustainable agriculture** and set as their priority how to actually help the environment and not harm it further. The solution to this is precision irrigation, using smart irrigation tools and equipment, such as **drip irrigation** and **mini sprinklers**, in order for farmers to have healthy and large yields.![agriculure-system-in-use.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/why-precision-irrigation-is-the-only-way-to-sustainable-agriculture/agriculure-system-in-use.jpg)

Furthermore, there are smart systems that are in line with environmental conditions and **topography**, ensuring through controllers, sensors, sprinklers, and **piping systems** precise fertigation, while they apply the required **nutrients and water** at the optimal time and quantity. In this way, unnecessary chemicals are not used, helping the reduction of greenhouse gases and adding to the overall wellbeing of the planet. **Precision irrigation systems**, therefore, are not only water and cost-efficient but also help farmers comply with new environmental policies and, at the same time, to meet effectively growing demand.

For the **perfect irrigation system** for your own land, Elysee has a wide variety of products and solutions, which ensure precision irrigation. As a result, you can succeed adequate watering right to the root zone, minimise the risk of under or over-watering, score **high water savings**, and grow healthier plants.![agriculure-system-for-trees-in-use.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/why-precision-irrigation-is-the-only-way-to-sustainable-agriculture/agriculure-system-for-trees-in-use.jpg)

**Elysee** vows to provide a great experience to all customers, as well as **irrigation products** of the highest quality and which are easy-to-install. What is also important is that all products are eco-friendly and corrosion-free, **patented** and engineered in Elysée’s in-house R&D facility.

For more information, feel free to contact Elysee’s technical office team to learn more about their innovative and smart products and find solutions to cater your needs in the best possible way.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/why-precision-irrigation-is-the-only-way-to-sustainable-agriculture/irrigation-a-farmer-is-checking-the-plants.jpg',
 'Elysée Group',
 '2021-08-09T12:00:00Z',
 3,
 true),
('bountiful-harvest-3-summer-vegetales',
 'Bountiful harvest: 3 popular summer vegetables to grow in a greenhouse',
 'Summer is well underway, and the high temperatures beg for diligent crop care. If you want to ease your mind about taking good care and properly watering your summer crops, you need to create the…',
 $md$**Summer** is well underway, and the **high temperatures** beg for diligent crop care. If you want to ease your mind about taking good care and properly watering your summer crops, you need to create the optimum conditions by choosing the most **effective drip irrigation system** that is based on precision. In this way, you will produce a **bountiful harvest** that you can enjoy on a daily basis! Here are some tips and advice for **3 of the most popular summer vegetables**: tomatoes, bell peppers, and cucumbers.![tomatoes.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/bountiful-harvest-3-summer-vegetales/tomatoes.jpg)

**Tomatoes**

One of the best vegetables to grow in a **Mediterranean climate** is tomatoes. **Tomatoes** require a warm weather and lots of sun to grow, approximately 6-8 hours a day. Although they have a long growing season and require approximately 1-1.5 month for harvesting, it is better to plan their bumper crop by August. You have to be careful not to overwater your tomato plants. If you see cracked fruit and bumps or blisters on the leaves, then you are definitely overwatering your tomato plants and, if this continues, the roots will gradually die.![peppers.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/bountiful-harvest-3-summer-vegetales/peppers.jpg)

**Bell Peppers**

Along with your tomatoes, you can also plant **bell peppers**, as they share similar needs. They too require a warm, sunny weather, rich and nutritious soil, and proper water application. If you want to create the perfect environment for both your peppers and tomatoes, choose advanced non leakage drippers with a multi-channel nutrient dosing machine. In this way, you can ensure that the climate, **irrigation**, and fertilization of your crop is done in the best possible the manner.![cucumbers.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/bountiful-harvest-3-summer-vegetales/cucumbers.jpg)

**Cucumbers**

Unlike tomato plants, the growth season for **cucumbers** is shorter. In warm climates, like our climate in Cyprus, you need less than a month from planting to harvest and another 7-8 weeks for the completion of the harvest period. For guaranteeing that the growing of your cucumbers is effective, you need to make sure that the EC, pH, and nutrient levels in the root zone are in the correct levels. For succeeding this, you should definitely choose the appropriate dripper or a **precise dosing system**.

While we are talking about three different vegetables, with each one having its unique requirements, they all have a common need: They depend on the appropriate **irrigation solution**, which is based on precision so that there is adequate watering to the **root zone**, hence, your plants are not under or over-watered. **Elysee** has a wide selection of **irrigation products and solutions**, expandable and suitable for both residential and commercial use. In this way, you can choose the perfect solution for your own needs, achieve high water savings, while, at the same time, making sure that you are nourishing **healthier plants**.

**Elysee** is committed to providing a great experience to all customers, as well as irrigation products of the highest quality and **easy-to-install**. What is also important is that all products are eco-friendly and corrosion-free, patented and engineered in Elysée’s in-house R&D facility. Due to the company’s “green thinking”, they offer the **maximum water saving** and, simultaneously, provide the plants with their individual needs of water.

For more information, feel free to contact Elysee’s technical office team to learn more about their innovative and smart products and find solutions to cater your needs in the best possible way.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/bountiful-harvest-3-summer-vegetales/tomatoes.jpg',
 'Elysée Group',
 '2021-06-24T12:00:00Z',
 3,
 true),
('summer-tips-to-water-your-garden-properly',
 'Summer tips to water your garden properly',
 'The summer is already here, and it is important to hydrate not only yourselves but for your garden as well!',
 $md$The summer is already here, and it is important to hydrate not only yourselves but for your garden as well! To do this, you should be well-informed on how to make sure that your plants will survive and thrive in the heat of the summer.![woman-relax-in-garden.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/summer-tips-to-water-your-garden-properly/woman-relax-in-garden.jpg)

First of all, the time of day that you water your plants plays a huge role. Prefer to water your plants in the morning, when the weather is cooler, to help the absorbance of water. Also, you should always make sure that your soil is evenly moist. This means that your plants shouldn’t be overwatered or underwatered, but to be watered just before they go completely dry. A simple way to check how moist the soil is the “finger test”. Your finger should not come out completely clean but have some soil on it.

In any event, the soil should be of high quality and rich in nutrients and clay materials. An extra measure that you can take for improving the quality of your soil and, at the same time, reduce evaporation is to apply mulch to the surface of the soil. To do this, you can use organic material like shredded leaves, pine needles, compost, or grass clippings. However, you should have in mind that mulch sometimes prevents water from reaching the roots and may remain in the upper soil. To keep the roots strong, you should water at the base of the plant while keeping the leaves dry for avoiding any burn marks. A common misconception is that brown or yellow leaves mean that your plant needs more water. However, exactly the opposite applies: brown edges or a yellow hue is a sign that you have been overwatering your plant.![tree-planting.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/summer-tips-to-water-your-garden-properly/tree-planting.jpg)

We cannot stress enough that not only the right amount of water is necessary for maintaining a good soil quality but also the uniform distribution of water. To achieve this, a drip irrigation system is the optimum choice since it delivers the water very slowly and specifically to the roots. This also promotes a “green” behavior since there is very little water wastage. For even better results and “greener” solutions, you should choose an automatic irrigator with moisture sensor which will water your plants only when they need it, hence, irrigate in a way that saves as much water as possible. A good irrigation system will also put your mind at ease when you are on holidays since you can always set an automatic timer to water your garden whenever you want. You can even control the system via an application on your mobile phone or tablet.![soil.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/summer-tips-to-water-your-garden-properly/soil.jpg)

At Elysee you can find the best solutions for your garden. Elysee’s staff is certainly committed to providing a great experience to all customers, as well as helping to choose the highest quality landscape irrigation products (easy-to-install, eco-friendly, corrosion-free products which are patented and engineered in Elysee’s in-house R&D facility). In this way, you can achieve the minimum water wastage and meet your plants’ every need. For more information, not only on these topics but on many more, download Elysee’s new, comprehensive FREE e-book, which covers modern landscape irrigation strategies, tips, techniques, and hardware for smart landscaping!

Feel free to contact Elysee’s technical office team to learn more about their products and find solutions to cater your needs in the best possible way.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/summer-tips-to-water-your-garden-properly/soil.jpg',
 'Elysée Group',
 '2021-05-24T12:00:00Z',
 3,
 true),
('nils-henrik-tuastad-production-manager-digital-transformation-is-imperative-for-all-businesses',
 'Nils Henrik Tuastad, Production Manager: "Digital Transformation is Imperative for All Businesses"',
 'Nils Henrik Tuastad, Production Manager at Elysee Irrigation, recently gave an interview to the prestigious INBusiness magazine, published in Greek.',
 $md$Nils Henrik Tuastad, Production Manager at Elysee Irrigation, recently gave an interview to the prestigious INBusiness magazine, published in Greek. We’d like to bring you the highlights of the points raised during the interview, an insight into our business and our ethos, focusing on Digital Transformation and how our company is adapted in the new capabilities of digital developments.![nils-1.JPG](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/nils-henrik-tuastad-production-manager-digital-transformation-is-imperative-for-all-businesses/nils-1.JPG)

Nils was asked about the impact of digital transformation on Elysee, and also how Elysee was prepared to cope with the pandemic. His reply acknowledged the need to make fast, real-time decisions in order to remain competitive in the market and touched on the changing needs of the customer. These days, delivery time and production flexibility are as important as quality and cost. No longer is simply maintaining high stock levels a sufficient compensation for lower production capacity. From robotic operations during the manufacturing processes to interacting with global customers via social media, digitization is now an essential part of any business.

With regards to the pandemic, of course, no one could predict quite the impact this would have on the world, but Elysee was relatively fortunate due to the infrastructure for remote working already being in place. The administrative side of the business carried on pretty much as normal. Elysee’s HR and H&S departments worked quickly to ensure that production could continue in a safe manner and so thankfully, Elysee continued to be productive throughout the pandemic.

Nils went on to explain that as technology changes, Elysee embraces the new innovations and is always looking for ways to use new technologies to make products faster, with lower costs and better results. Ultimately, shortening the ‘time to market’ for new products. The digital world is fast-moving, and to get the very best from these new innovations, it’s important to ensure they are utilized to the full. The team at Elysee had differing levels of computer knowledge when the business first began to implement a greater level of digital technology, however, Elysee is dedicated to furthering the abilities of all staff members, and so a high level of training was given to ensure that everyone at Elysee could confidently use all the technology and boost their own computer skills too.

It is well known that Elysee is aiming to be a global green leader and have had the protection of the environment as a key factor in all decisions the business makes, and so Nils was happy to elucidate on some of the ways in which digital transformation has helped improve the company’s green credentials. These include continually assessing processes to make them more efficient, optimizing energy-consuming activities, enhancing machinery and processes to use less energy, incorporation of green energy production in business operations, and the utilization of recycled materials without impacting quality. As an example, 30% of Elysee’s energy usage now comes from renewable sources.

For all businesses, technology and digital transformation are the way forward. It’s an essential part of every business and every life and so it’s important for us to make the most of these exciting opportunities to boost business, enhance productivity and create even better products.

Here at Elysee, we are so proud of the collaborative work of every single member of our team. We share a vision, and a mission, to constantly strive to not only make our business the best it can be but to make the planet the best it can be too.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/nils-henrik-tuastad-production-manager-digital-transformation-is-imperative-for-all-businesses/dsc8478-final-copy-Lwz68.jpg',
 'Elysée Group',
 '2021-04-26T12:00:00Z',
 3,
 true),
('we-firmly-invest-in-our-people',
 'We Firmly Invest in Our People',
 'Elysee Irrigation, a worldwide leader in the design and creation of innovative and practical irrigation systems, regards its personnel as its most valuable asset.',
 $md$Elysee Irrigation, a worldwide leader in the design and creation of innovative and practical irrigation systems, regards its personnel as its most valuable asset.

It believes in them and, exactly for that reason, it invests in them.

Adopting an exemplary, genuine anthropocentric philosophy, Elysee Irrigation considers personnel care as a number one priority, while investing in new models of strategic training and staff assessment.

This short article presents an overview of several initiatives of the company in this regard.![elysee-team-photo.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/we-firmly-invest-in-our-people/elysee-team-photo.jpg)

**A New Personnel Assessment System**

Elysee’s impressive feats over the years have been based and founded on a specific belief: its development is ensured and realised through the individual development of each and every one of its staff members.

Fully embracing this view, Elysee Irrigation has invested time, effort and significant resources in training properly its staff, while developing a highly sophisticated personnel assessment system, aiming at constantly improving its efficiency.

In this context, 190 staff members were carefully selected as personnel assessors, while similar training sessions helped the rest of the staff to contribute meaningfully to the whole process. The main goal of this training program was to help the assessors understand the upgraded assessment system, and thus ensure its most efficient implementation.

This improved system ensures the fair and objective evaluation of all staff members.

**Staff Safety & Sustainable Development are Our Priorities**

Elysee Irrigation always considered staff safety among its top priorities, examining over and over again its procedures and working conditions to ensure their well-being safety, while pursuing its vision for sustainable development.

In line with its effort, the Company succeeding in acquiring three rather important international certifications during the last year: ISO – 45001, regarding staff safety and protection, as well as ISO – 14001 and EMAS (which is granted exclusively by the European Parliament), regarding its environmental management system.

**Showing Workers its Gratitude**

Besides the upgraded assessment system and training program, Elysee took another exceptional initiative for its workers, which had both symbolic and practical significance.

Despite the exceptionally difficult circumstances that plagued humanity and the world economy over the last year, Elysee had a successful financial year, developing further its technological innovations and its clientele.

Acknowledging that this amazing feat -considering the difficult circumstances all over the world- came as a result of the efforts, diligence, and dutifulness of its staff, the Company decided to offer each one of them, aside from the additional 13th salary, a bonus of 200.00 Euros.

In this way, Elysee expressed its appreciation and gratitude for their sedulity, diligence, and passion with which they share the company’s values and vision.

Investing in the holistic development of its personnel, Elysee strives for a sustainable and greener future, offering internationally acclaimed products of unparallel quality and contributing significantly to the evolvement of local communities with its services.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/we-firmly-invest-in-our-people/elysee-team-photo.jpg',
 'Elysée Group',
 '2021-03-29T12:00:00Z',
 3,
 true),
('productivity-in-installation-how-elysee-vows-to-improve-on-site-efficiency',
 'Productivity in Installation: How Elysee vows to improve efficiency',
 'Here at Elysee we’re dedicated to improvement, and that ethos relates to every aspect of our business.',
 $md$Here at Elysee we’re dedicated to improvement, and that ethos relates to every aspect of our business. We pride ourselves on our high level of customer service, reflected in the great feedback we get back from our customers, and the recommendations they pass on. We spend a great deal of time inventing and creating new products and enhancing our existing product line, all within our own in-house R&D facility. It’s important to us to make our products easier to use, to ensure they are robust and long-lasting, and that their impact on the environment is minimal. We make sure that all Elysee products are manufactured according to the strictest regulations and quality standards so our clients receive the best possible products along with great customer service, so projects can go as smoothly as possible.![product-assembly-machine.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/productivity-in-installation-how-elysee-vows-to-improve-on-site-efficiency/product-assembly-machine.jpg)

**A changing environment**

Over the last few decades, much has changed in the world of construction. New materials have been created, rules, regulations and specifications have been altered and added to. The construction business is very different to how it was 50 years ago, except for one thing. Productivity levels have remained fairly unchanged over all these years. Some recent research even shows a decline in productivity in these areas.

**How Elysee can help**

So of course, when we see a need, we want to try and fulfil it, and so we’ve put a great deal of thought into developing innovative solutions for increasing installation site productivity. Whatever type of installation project you have underway, increasing productivity levels by using products that are easy to use saves time, and saving time of course also means saving money. Whether it’s a huge construction site or a small project, for your business or simply for yourself, an increase in productivity is certainly a big advantage.![rnd-design-sdSfY.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/productivity-in-installation-how-elysee-vows-to-improve-on-site-efficiency/rnd-design-sdSfY.jpg)

**Every iteration is an improvement**

So, we constantly reassess every product and look at how we can improve and enhance it. We always have in mind how we can make fitting and installation processes simpler. From ease of attaching fittings together, to pipes that are easy to bend, if you look hard enough and have a team of clever and inventive people, you can always find a way to make a great product even better.![pipes.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/productivity-in-installation-how-elysee-vows-to-improve-on-site-efficiency/pipes.jpg)

**Teamwork is key**

At Elysee, we have a large team of specialists, from technical consultants to expert engineers. Our teams spend a lot of time in collaboration, alongside our customer service team who know exactly the problems our clients are facing and the requirements they have. It is this teamwork that enables brilliant ideas to flow, and eventually those ideas become a reality. Attention to detail is paramount because with projects such as the installation of pipework, if you can make even the tiniest fitting a little easier to use, over the course of a project you can save an installer a lot of time and a lot of headaches!

**Find out more**

If you’d like to discover more about our wide range of products or ask our experts for help with your project, please get in touch. We cater for both commercial and residential projects, so don’t hesitate to ask if you have any questions regarding your next installation.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/productivity-in-installation-how-elysee-vows-to-improve-on-site-efficiency/product-assembly-machine-uIl6U.jpg',
 'Elysée Group',
 '2021-02-22T12:00:00Z',
 3,
 true),
('spark-13-benefits-of-the-innovative-micro-sprinkler-system-designed-for-cleaning-solar-panels',
 '"Spark": 13 benefits of the innovative micro-sprinkler system',
 'When it comes to harnessing the sun’s energy, you want a solution that’s as low maintenance as possible.',
 $md$When it comes to harnessing the sun’s energy, you want a solution that’s as low maintenance as possible. The problem with solar panels is that they tend to rapidly accumulate dirt and dust due to their location which is often in an agricultural or industrial setting. Regardless of the setting, your solar panels will need to be cleaned regularly if they are to remain efficient. When a layer of dust, dirt or soot settles on your panels, your electricity production rates begin to fall. The dirtier the panels, the less productive they are, and the lower your energy yield. So, whether you have a few panels to power your home or business, or a huge solar energy farm, you’ll need to keep your panels clean. You could set to and wash them all yourself, but that’s incredibly time-consuming and if your panels are at height, also potentially dangerous. Why clean your panels manually, when you can clean them with Spark? An innovative self-cleaning system specifically created to transform solar panel maintenance.![photovoltaic-system-with-spark.png](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/spark-13-benefits-of-the-innovative-micro-sprinkler-system-designed-for-cleaning-solar-panels/photovoltaic-system-with-spark.png)

Elysee can provide you with a complete Spark system, ensuring all parts, including tanks, feed pump, spray module, automation, pipes and fittings are carefully selected to work perfectly together. But first, let’s take a look at some of the benefits of this ground-breaking system…

**1- It’s fully automatic**

The system runs totally by itself; your input is not required so you can truly leave it to do the work for you.

**2 – Your panels will always be clean**

You can rest assured that your panels will always be clean without having to check them so you’ll have no downtime due to dirty panels.

**3 – You’ll achieve optimal energy production at all times**

Your solar panels will be functioning at optimal levels all the time, so your energy yield will always be at its maximum.

**4 – It saves manpower**

Whether you’re saving your own time or saving the money you’d spend hiring someone to clean your solar panels, it’s certainly going to be better when your panels clean themselves!

**5 – It’s the safest option**

You’re cutting out the risk of accident when cleaning manuals manually, which is particularly important if your panels are elevated.![spark-system.png](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/spark-13-benefits-of-the-innovative-micro-sprinkler-system-designed-for-cleaning-solar-panels/spark-system.png)

**6 – The system doesn’t rely on electricity**

With no requirement for electricity to run, Spark can be implemented literally anywhere.

**7 – The system is durable and has a long life**

Spark has been specifically developed with longevity in mind. So the fixed, durable parts have been created to withstand the harshest of conditions from high winds to high temperatures.

**8 – You can reduce the distance between panels**

With the Spark system in place, you can cut down the distance between panels and so gain more energy production within your available space.

**9 – It offers ideal water distribution**

Water distribution is perfectly optimised to be equally distributed over the entire panel and across all panels in the system with no weak points.

**10 – Easy to assemble, simple to operate**

Both setting up and running the system is uncomplicated and stress-free.

**11 – The system can be adjusted to demand**

Spark can be easily and quickly adjusted to meet unprecedented demand such as a sudden dust storm.

**12 – It’s totally scaleable and customisable**

Spark is suitable for all solar projects, regardless of size or location. It can be customised to perfectly suit every circumstance.

**13 – A sustainable choice**

Plans for reusing the water used to clean the panels are put in place to ensure there is as little wastage as possible.![photovoltaic-installation.png](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/spark-13-benefits-of-the-innovative-micro-sprinkler-system-designed-for-cleaning-solar-panels/photovoltaic-installation.png)

**Would you like to know more?**

This innovative system could transform your solar energy project, saving you time and money. Elysee offers a customised implementation service, tailored to your personal requirements and the package includes the hydraulic design as well as implementing recommendations issued by agronomic and engineering professionals. If you would like to know more about how Spark could be installed on your solar panel projects, please get in touch with our experts here at Elysee who would be very happy to talk to you about your requirements.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/spark-13-benefits-of-the-innovative-micro-sprinkler-system-designed-for-cleaning-solar-panels/spark-system.png',
 'Elysée Group',
 '2021-02-10T12:00:00Z',
 4,
 true),
('10-step-guide-to-designing-an-efficient-irrigation-project',
 '10-step guide to designing an efficient irrigation project',
 'Designing an irrigation system from scratch can seem like a rather daunting task. There is so much to consider and so many factors involved.',
 $md$Designing an irrigation system from scratch can seem like a rather daunting task. There is so much to consider and so many factors involved. The larger the project, the more complex the design process will be, and the greater the risk should your design prove to be inadequate. Make mistakes at the design phase and you could be making some very costly errors, or end up with a system that simply doesn’t work as you’d envisaged. However, with careful planning and plenty of forethought, you can create a system that will work perfectly and be as cost-effective as possible. Follow our step by step guide to designing an irrigation project and you can rest assured that you’ve considered every factor that could have an impact on your system.![agriculture.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/10-step-guide-to-designing-an-efficient-irrigation-project/agriculture.jpg)

**Get Prepared**

**Step 1 – Survey the land**

The first step is to analyse the land you’re going to irrigate and define its contour and topography. Is the land sloped or flat? Does it have a hill in the middle? All this will make a difference to your flow of water. Check where the sun falls. Are there shaded areas? Where does the sun rise and fall? Check how exposed the land is to the wind, and the most frequent wind direction. Does the area have good drainage? Are there any boggy parts? Is it nutrient deficient?

**Step 2 – Check and define the soil**

Determine what type of soil you have. Is it heavy, light or clay? It’s also a good idea to test your soil for any deficiencies in nutrients as this is something you can begin to rectify once you’ve installed your irrigation system.

**Step 3 – Define the water source**

Where is the source of the water you’ll be utilising? Is it a river, a lake, or an underground source? Is that water source available all year round? For example, if you’re using water from a lake that dries up in mid-summer then this is going to be an issue. You should also test your water source to determine its quality, checking for levels of iron and saline and seeing if there is algae present.![agriculture-2.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/10-step-guide-to-designing-an-efficient-irrigation-project/agriculture-2.jpg)

**Make Decisions**

**Step 4 – Choose cultivation methods**

Next you need to decide on your cultivation type. Will you have rows of crops, an orchard or perhaps you’ll change method with the seasons? How much space/distance will you have between individual plants, and between the rows? Will you be growing plants in a particular pattern or will you have a free form?

**Step 5 – Choose an irrigation system type**

Now is the time to determine which type of irrigation system will be the best fit for your circumstances. Consider the pros and cons of flood systems, drip irrigation and mini sprinklers, and decide which is best suited to your project.

**Step 6 – Creating a proper design**

When it comes to designing the system, this is where mistakes can occur. It’s always a good idea to hire the skills of a certified designer to ensure this part of the project is completed successfully.

**Step 7 – Sourcing the best products for the task**

Another costly mistake can be choosing products that are not fit for the purpose. So, make sure you buy good quality products that you know will do the job and serve you well for a long time. You’ll need hoses, filters, fittings, control systems, and emitting devices, and they’ll all need to work perfectly together.

**Step 8 – Installation**

As with the design stage, proper installation is a job best handed over to a certified installer to ensure that the system works perfectly and is as efficient as possible.

**Operation**

**Step 9 – Watering and fertigation management**

Once you’re up and running, you’ll need to keep a close eye on your system and establish a routine of ensuring the watering and fertigation all runs smoothly. These days there are a variety of control systems that can help to automate the running of your irrigation system, so you have less work to do, but it makes sense to have a routine to check and manage your system.

**Maintenance**

**Step 10 – Follow certified guidance**

Your system will serve you well and last longer if you maintain it properly, so make notes of any maintenance guidance given to you by your installer and read all the documentation from the manufacturers of your irrigation products. A well-maintained system is the key to smooth operations.

**How we can help**

Elysee can help you with your next irrigation project in several ways. Our expert team are available to assist you with the design process. Get in touch with our technical office team and you can avail yourself of their expertise in auto-cad design for your project and use the resulting material bill of quantities in order to fully meet your needs while saving water and keeping your costs at a minimum. To find out more, do get in touch today.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/10-step-guide-to-designing-an-efficient-irrigation-project/agriculture.jpg',
 'Elysée Group',
 '2021-01-04T12:00:00Z',
 5,
 true),
('zero-force-installations-10-1-customer-benefits',
 'Zero Force installations: 10+1 customer benefits',
 'With our own in house R&D department, we’re always looking for new ways to offer our customers something better, products that make life just that little bit easier.',
 $md$With our own in-house R&D department, we’re always looking for new ways to offer our customers something better, products that make life just that little bit easier. We love developing new products that are easy to install and eco-friendly, and so we’re very proud of our Zero Force range which literally takes the strain out of installations.![elysee-meeting.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/zero-force-installations-10-1-customer-benefits/elysee-meeting.jpg)

Zero Force is the perfect complement to our wide selection of piping solutions. All our products are created to the highest quality standards and adhere to all regulations. We pride ourselves on the quality of our products, that also benefit from ergonomic design and are low maintenance too.

Zero Force compression fittings are used to connect metric Polyethylene pipes with ease, due to the innovative product design. Complying with all international standards relating to compression fittings, these unique products are 16 bar rated. There’s no need to remove the nut from the body of the fitting, simply unfasten the nut to loosen the split ring for ease of movement for the addition of the piping. So simple, no pressure, and perfectly sealed by fastening the nut with a wrench.

Seeing that the inner parts are easy to move, by placing the PE pipe into the fitting and then with a slight axial force, the pipe can go all the way through the nut, split ring and seal until meets the 1st resistance. Fastening the nut firmly, with the use of a wrench, ensures optimum sealing conditions during operation.![elysee-products.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/zero-force-installations-10-1-customer-benefits/elysee-products.jpg)

**The key benefits of Zero Force are...**

1. A complete range of fittings are available - from 75mm to 110mm.
2. Ease of pipe installation with no force required for insertion.
3. Disassembling components during installation is not necessary.
4. The products conform to all hygiene and sanitary regulations and requirements.
5. The products have been fully tested to ensure they meet the highest of related standards.
6. They’re specifically designed to have a long lifespan.
7. They’re resistant to chemicals and abrasion.
8. To ensure the optimum pressure resistance, all Zero Force products are manufactured using the highest quality raw materials.
9. Specially designed ergonomic nuts enable ease of handling.
10. A tried, tested and proven leak-free design.
11. An ultra-modern design.

**Save time and effort with Zero Force**

Once you’ve tried Zero Force, you’ll wonder how you ever managed without these innovative products. Saving you so much time and effort when compared to standard compression fittings, your installations become easier and less strenuous with Zero Force. As with all Elysee products, you have the peace of mind that these products have been carefully developed, manufactured to the very highest standards, and fully tested to ensure their effectiveness and longevity. Discover the full range of Elysee products on our website or get in touch if you have any questions regarding Zero Force or any of our other product ranges. We offer a wide range of solutions for both commercial and residential projects.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/zero-force-installations-10-1-customer-benefits/dsc0682-TyRbk.JPG',
 'Elysée Group',
 '2021-01-04T12:00:00Z',
 3,
 true),
('third-party-certification-8-advantages-for-elysee-customers',
 'Third-Party Certification. 8 advantages for Elysee customers',
 'We know our products are designed and created to the very highest standards, and so we’re very happy to submit our products for third party certification, for unbiased approval.',
 $md$We know our products are designed and created to the very highest standards, and so we’re very happy to submit our products for third-party certification, for unbiased approval. Third-party certification basically means that an independent body has assessed a product, and the process of its creation, and deemed it to be perfectly compliant with regards to a variety of factors such as quality, safety, durability etc. The third parties are entirely impartial, so you can totally trust their verdict on any product you purchase.

We feel strongly about our products, and we want you to have the peace of mind that our third-party certifications can offer. We feel there are many advantages to having our products fully certified and here are some ways in which it benefits you, our customers.![dsc8501-1-copy-0j2PV.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/third-party-certification-8-advantages-for-elysee-customers/dsc8501-1-copy-0j2PV.jpg)

**1** – With certification, you have official assurance and acknowledgement of quality from all major independent certification organisations.

**2** – Our certifications verify that our products conform to product standards worldwide. Requirements and standards differ from country to country, so we ensure we comply with the requirements of all major national and international standards including German DVGW, Austrian OVGW, Swiss SVGW, UK WRAS, Israel SII, Australia - New Zealand AS/NZS4129, International ISO17885, European EN12201 and German DIN8076.

**3** – On a national level, the certification also ensures that local work conditions, environmental conditions and the local market common practices all meet requirements.

**4** – With third-party verification of our production and system procedures, long term production quality and stability is ensured.![lps4608.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/third-party-certification-8-advantages-for-elysee-customers/lps4608.jpg)

**5** – Conformity of our compression fitting products with regards to quality is ensured by approval and certification of raw materials.

**6** – The suitability for the conveyance of potable water is ensured by our adherence to strict international and national standards such as UK BS 6920, German KTW, AUS AS/NZS 4020 and Netherlands KIWA BRL-K17504.

**7** – Our green credentials are also assured with conformity to all national and local water-saving, environmentally friendly applications and operations requirements.

**8** – By using certified components in pipe fitting, conformity of the entire system can then be guaranteed.

**For more information…**

To discover more about our certified products and find out how we can help you with your next project, do get in touch or visit our website today. We are dedicated to providing a superb customer experience to all, alongside high-quality products you can rely on. You’ll find more information regarding our third-party certifications on our website along with details of all our easy-to-install, eco-friendly and corrosion-free products, all patented and engineered in house by Elysee.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/third-party-certification-8-advantages-for-elysee-customers/dsc8501-1-copy-0j2PV.jpg',
 'Elysée Group',
 '2020-12-07T12:00:00Z',
 3,
 true),
('smart-landscaping-a-guide-to-water-and-cost-efficient-irrigation',
 'Smart Landscaping. A guide to water and cost-efficient irrigation',
 'It’s so important to look after our planet, and one way in which we can play our part is to minimise the water we use and prevent wastage.',
 $md$It’s so important to look after our planet, and one way in which we can play our part is to minimise the water we use and prevent wastage. By using an irrigation system, you can save money, and when you have a garden or crops that water themselves, you’re also saving time. Modern irrigation systems have a lot of great features that make them increasingly customisable, controllable and cost-effective.

Your new irrigation system can actually save you money and so could be considered a long-term investment. With some many innovative products on the market, it can be hard deciding which irrigation system would be the best fit for your land, so it’s a good idea to understand a little about the two main types of irrigation system available, drip irrigation and sprinkler systems.![smart-landscaping-elysee-1.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/smart-landscaping-a-guide-to-water-and-cost-efficient-irrigation/smart-landscaping-elysee-1.jpg)

A drip irrigation system delivers the water right at the base of the plants, directly to the roots. The water is delivered slowly so there’s no issue with runoff or water pooling. For bushy plants with a dense cover above their roots, this system ensures this type of plant gets enough water. The system does not suffer from loss of water due to evaporation, and it’s easy to control water quantity in each area such as plants that require extra water compared with those that need watering less frequently.

**Sprinkler systems**

A sprinkler system, however, will sprinkle water over the plants. With good planning, a sprinkler system can be made to be very efficient, and it’s a great option for large areas such as lawns. Advanced in-ground sprinkler systems are now available that can be permanently set up and turned on and off at will, or set on a timer. These in-ground systems are barely visible making them a great option for front gardens of homes and also eliminates the tripping hazard of hoses, as well as the time in setting a system up that is only used temporarily then dismantled.![smart-landscaping-elysee-2-ETXwa.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/smart-landscaping-a-guide-to-water-and-cost-efficient-irrigation/smart-landscaping-elysee-2-ETXwa.jpg)v

**Automating your system**

By adding automation to your system via the use of solenoid valves and timer controls, you can maximise your savings of water, time and money.

**Move into the future of irrigation**

Smart irrigation is the way of the future. Control your irrigation from your smartphone so you don’t even have to be in the same country as your garden! Advanced irrigation systems can certainly make life easier for you, and with a good set up, you can save money too. Getting a professional irrigation design is the first step you should take. This will ensure that the needs of you, and all your plants are met and that the maximum water saving is achieved.

If you’re interested in taking this step forward to a better and smarter way to water your garden or crops then please get in touch. The Elysee technical office team are here to provide a detailed auto-cad design alongside a material bill of quantities. We look forward to providing you with our high-quality irrigation solutions. Get in touch today for more information.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/smart-landscaping-a-guide-to-water-and-cost-efficient-irrigation/smart-landscaping-elysee-1.jpg',
 'Elysée Group',
 '2020-12-07T12:00:00Z',
 3,
 true),
('become-a-member-of-our-global-network-10-1-reasons-to-partner-with-elysee',
 'Become a member of our global network: 10+1 reasons to partner with us',
 'Since we first started business back in 1979, we have constantly focused on improving our business in any way we can.',
 $md$Since we first started business back in 1979, we have constantly focused on improving our business in any way we can. From increasing our green credentials to designing our own products in-house and offering the very best level of customer service. We strive to be better, year on year. It is our dedication, our decades of experience, and our attention to detail and quality that ensure our confidence when we say that you should join our global network and partner with us. We believe, when you work hand in hand with us, your business will go from strength to strength alongside ours. Here are 10+1 reasons why…

**1 – The highest quality products**

We ensure that every product we offer you is made to the very highest of standards, from top quality materials, and manufactured to be easy-to-use, with a modern, ergonomic design.

**2 – Our own R&D and QC departments**

We have our own in-house Research and Development, and Quality Control departments. This ensures that all our products are thoroughly researched to be the best they possibly can be, and very well tested so they’re robust, long lasting, high quality and perform exactly as you need them to.![](https://uc0255e5e496a3792cbbe02304cc.previews.dropboxusercontent.com/p/thumb/AA-YJmqaLgDU9REhXJWEFJOo4uGGDAORVOxs7_Xgy7yGYMlhlkJsI0HE_YtZE_u_mWQIB37DYAoUbrAEsRhh9IPuT789oPSoAstL4FSrBgIyCcyWosFZOWuHeJxfWEehYJ0SEVWOejK0JFL12jEOz1gx7Fu8lbiJjAc4hyqNnptVWG4RFWJfwUIEQTRBZ37mEJfaxBfQJwrN7jlRhGcZfPEjibSwbfoy1yq32xBujXe_E21RRWSm3pllXcugeGx8ZsOGpOIP3b_363WbJ8QMs78qdEsdzN1JVp7NyoOeoFao5-QHZcxw_jLnCMLuhA9hn_IMLVyRexMFVT7wLogXS2_riXjB1WxIXW6eirdm0Xe_wijh7oIdaxyn7xVpxev2DemgVesck44P16JvxR-SELoSkdm94pqUf1zX_BweenMSeBJAFakXpRnHmb1f347mQDoR_Y56EMWv7VuBiICbMkyPJKJMGnW4HWM3tOonE5DTKYMcvJ-A2bhkByfytrmdksrVi_nTAnvtPEYgi5qkKvLuR__GyyzWl4YgEZWWs3Wo9_DhS8fGi-cKlCvVxfjF2vh6WkrKwUjc6ziY393DIHou27tUDzfomk2u2rBg15y5lw/p.jpeg?size=800x600&size_mode=3)

**3 – OEM products and custom-made solutions**

We love to solve every problem in the best way possible. That’s why we offer custom-made solutions and OEM products.

**4 – Competitive prices**

You’ll find all our prices are very competitive. Feel free to shop around, but you can rest assured that our prices offer great value and our customer service is second to none.

**5 – Worldwide distribution centres**

For global convenience, we have distribution centres in Austria, Russia, and Lebanon.

**6 – Fast, safe deliveries**

We ensure your products arrive with you as quickly as possible, packed securely and delivered safely.![](https://uc6e064a3b47851b86228c66277b.previews.dropboxusercontent.com/p/thumb/AA_sDSCPlN-WsRTZPqUAo1yeB0a0b7DCg0-8LaYxFekv-JvvThLR5kJVZKFyUSVnzj5BZaO65-98Ks4-8mS1dBzym3Qm5nJlKI1oSkY3eRCo_AMuu9iWEf-VAW-eX8e_RVAwaTMUoeVztMRHmCtRyz-GUQMAg62tPAaNk3shVLOa7tdTJ55pakRhOB4y3Cf-915mqNh7NJVRDkRacAEriJ9Fpi12IEZXRBzv41hFqNFxTaeqkts6s6YUhUWRzp3nnudS0_SMDRy4qX0txJuIh0Uu9WJnaaLP42XJN4DAGQR7Mz3Tt8Qo2CJmEroThBZ7YiJ9Fcwyj3i1-eGEMUOyJ-GxLiviZU9M-nctH-5ULWql17NBhCnFaAbik29hYyX9y4MKaFNqQkBxYL-DepfK_akDDxCWbCsdHadWQ-cPRydW-gUGqihUCAq-CWYtJO1ufemf4RLhFMgWEe9KKwXuvGsOMGibT51xQpLHjI7ZSv5MX36sDJc9bsxr6MPdazjDsYsPf6xsiXzuTDHyEXhYAWV-ghWUjvKUj3KQF7xW3imG3ASqKeH993ppghmfyps988D4GrrX6bNTEe-QxzfiScdjfEFJNFkX348GYtuCBxA3xCsmeXqVwSG6lBuTz3Zde57PdGTHQP8e3O0buSI_YcI2LNeQFcLuD1jBjQTLFQOtowmXyR9AL1C4R_zn3yDTTMoCwFcjL7h_5TJM_eIRa1GWzrmtcAdE36edq1QYc-j8uA/p.jpeg?size=800x600&size_mode=3)

**7 – Elysee cares and Elysee listens**

It is our customers and partners that have helped us build our business to what it is today, and of course this is very important to us. We are proud of the relationships we have developed over the years and decades and it’s important for us to maintain those relationships and learn from them too. We love to keep in touch with our clients, we’re always keen to hear your ideas and suggestions so we can adapt to individual market needs.

**8 – Consultancy and support is always available**

We know our industry inside out. We have many area managers close to the markets who are available to provide consultancy services and support. In short, we’re always here for our customers and partners, to answer any questions or offer help wherever we can, so don’t hesitate to get in touch to take advantage of our years of experience and vast market knowledge.

**9 – Loyalty is close to our hearts**

We believe that building relationships is the key to building a business and for this to happen, trust is the key. Mutual trust between partner businesses is what we aim for and is something we have achieved time and time again. Will you be our next trusted partner?

**10 – We’re always looking to the future**

Looking to the future is exciting. As a forward-thinking business, we’re always ready to innovate and keep abreast of the latest developments and technologies. This ensures we’re ahead of the competition and we can always offer you the latest products and services. As a business we’re constantly pushing forward with a long-term vision.

**11 – The future of our planet is so important to us**

Protecting the environment is in our minds with everything we do. We aim to play our part in creating a cleaner, greener future for the generations to come.

**Will you join us?**

If you feel our ethos and goals would work well alongside your own, then why not get in touch to learn more about becoming an Elysee partner? Together we can achieve more and we can help you to enhance your market stock and stay competitive. Get in touch today to find out more.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/become-a-member-of-our-global-network-10-1-reasons-to-partner-with-elysee/elysee-world.jpg',
 'Elysée Group',
 '2020-11-11T12:00:00Z',
 4,
 true),
('lean-management-at-elysee-the-potential-benefits-for-customers',
 'Lean management at Elysee',
 'At Elysee we believe in a holistic approach and Lean management fits well with our own philosophies, with far reaching benefits.',
 $md$At Elysee we believe in a holistic approach and Lean management fits well with our own philosophies, with far reaching benefits. Lean management focuses on reducing waste, so we’re preserving water and ensuring our processes are as efficient as possible, which is good for our business and great for our planet. Lean management also goes much further than this, and it is these intrinsic benefits that we believe are incredibly beneficial both to our staff and to our customers.

**Understanding our connections**

With Lean philosophies in mind, we ensure that each employee feels valued. Training methods are used to increase employee confidence, and we make sure that every person who works here at Elysee understands that they are part of a team. When you understand the processes, and see how your efforts have a beneficial effect on other team members, it creates real job satisfaction and boosts morale.

**Utilising key metrics for performance assessment**

We use Lean tools to measure and assess our processes. Our E-Lean Challenge runs across all departments and has been a huge success. This challenge allows us to recognise outstanding individuals and reward positive actions and efforts. Through this scheme, we have encouraged employees to submit more than 1000 ideas for improvement, many of which have been or will be implemented. We’ve also reduced safety incidents by 30% and efficiency has improved across the board.

**An ongoing philosophy**

Lean management is a concept that can evolve and grow so we’re forever changing and moving forward with these philosophies in mind. Improvement, reducing waste and ensuring we offer the very best customer service is highly important to Elysee and Lean management gives us the tools to do this very successfully.

**Lean management makes happy customers**

The effects of Lean management can be felt through every level of the business, in every department, and these benefits are then passed on to our customers. Our customer-centric approach ensures that every customer receives a high level of service, tailored to their own unique requirements. The value we deliver to our customers comes as a result of our continuous internal culture, and this is exactly the ultimate motivation for us. Our innovative products are designed to meet and to further exceed customer expectations. It’s in this way that the team of Elysee is proud and feels satisfaction from a job well done.

**Our promise to our customers**

With our Lean management philosophies in mind, we feel able to promise all our customers a great experience when they choose Elysee. Our highly trained and experienced staff will ensure you receive excellent service and can offer you any help or advice you may require in order to make the best choices from our product ranges. When you choose Elysee products, we promise that every single item is of the very highest quality. Choose our products that have been designed and engineered in house in our on-site R&D facility and you’re choosing products that will be easy to install, eco-friendly and corrosion free.

**Want to find out more?**

To discover more about our company, what we stand for, and the products and solutions we can offer you, browse our website.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/lean-management-at-elysee-the-potential-benefits-for-customers/dsc2219-2.jpg',
 'Elysée Group',
 '2020-11-11T12:00:00Z',
 3,
 true),
('reasons-to-invest-in-plastic-piping-solutions',
 'Reasons to Invest in Plastic Piping Solutions',
 'For many years, metal piping was the predominately used type of piping, and at the time, it served its purpose.',
 $md$For many years, metal piping was the predominately used type of piping, and at the time, it served its purpose. However, metal piping such as copper and bronze is not without its problems, and now homeowners and businesses are seeing an increasing amount of problems with metal piping as those pipes fitted years ago are now starting to show signs of age, namely corrosion and leaks. By using plastic piping now, you’re making the best choice for the moment, but you’re also saving yourself from some issues later down the line. If you’re not already using plastic piping, here are some very convincing reasons that should persuade you to make the change to plastics…![1.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/reasons-to-invest-in-plastic-piping-solutions/1.jpg)

 **It’s flexible for ease of installation**

The flexibility of plastic makes working with it so much simpler than metal pipes. Plastic pipes are easy to thread around joists and can be easily hidden within walls in new builds.

**It’s easy to cut and connect**

Plastic piping is so much easier to work with, you’ll save a lot of time. Plastic is easy to cut to size, and with the availability of push-fit fittings, it’s just so much easier than using metal and no specialist tools are required.![2.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/reasons-to-invest-in-plastic-piping-solutions/2.jpg)

**It’s proven to reduce the risk of leaks**

The main problem anyone experiences with plumbing is leaks. Locating and fixing leaks can be a time-consuming task, so make it easy on yourself by choosing plastic piping which is much less likely to leak than metal piping. It will save you a lot of time, money and hassle in the long run.

**It’s highly durable**

Choose high quality plastic piping and you have a product that’s incredibly durable and long lasting, giving you peace of mind that you’ve done all you can to prevent fractures and fatigue. Your plastic piping should serve you well for many years without having to be replaced or repaired.

**It’s less prone to theft**

With little scrap value, plastic piping isn’t a huge draw for thieves, so you’re less likely to have it stolen from a building site than if you were using copper piping.

**It’s a cost-effective solution**

What’s great about plastic piping is that, while it has many advantages over metal piping, this doesn’t come at a great financial cost, in fact, plastic piping is actually a highly affordable option.

**Find all your plastic piping solutions in one place**

Elysee have a huge range of plastic pipes and fittings, whatever types or sizes you want, you can rely on Elysee to provide the very highest quality products. This promise is easy to fulfil as Elysee have their own in-house R&D facility that oversees all patents and engineering. With Elysee products you’ll enjoy ease of installation with eco-friendly, corrosion-free products.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/reasons-to-invest-in-plastic-piping-solutions/1.jpg',
 'Elysée Group',
 '2020-10-14T12:00:00Z',
 3,
 true),
('elysees-characteristics',
 'Elysee: The Unique Characteristics That Have Driven the Company''s success',
 'Since the business began back in 1969, the passion and drive behind the company has ensured that Elysee has grown to what it is today, a highly respected world wide business.',
 $md$Since the business began back in 1969, the passion and drive behind the company has ensured that Elysee has grown to what it is today, a highly respected world-wide business. Enthusiasm, experience and expertise are what make Elysee stand out from the crowd, but there are more reasons why Elysee continues to move forward and thrive…![dsc2219-2.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/elysees-characteristics/dsc2219-2.jpg)

1. **Valuable products that perform as expected**

When you purchase any product from Elysee, you have the peace of mind that it has been specifically designed with ease of use in mind. Whether you’re a DIYer making some repairs on your home, or you’re building a block of residences, you want products that are simple to use and can be installed quickly with no fuss. We ensure that every product we produce is purposefully designed for easy installation and maintenance.

2. **In-house product development**

With our own R&D department, we can ensure that all our great ideas and innovative products are thoroughly thought through, tested and created to the highest of standards. It also gives us the opportunity to quickly and easily develop new products, so we are constantly innovating.

3. **We are committed to high quality, and to the environment**

We are confident that we can keep producing top quality products while remaining a Green leader! To prove this, we quote our innumerable certificates from the biggest quality organizations in the world such as EN ISO 1452, ISO 17885 and ISO 9001. We also have many prestigious international product certificates such as KIWA, DVGW, OVGW and SII.![push-fit.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/elysees-characteristics/push-fit.jpg)

4. **Diverse operations brings solutions for all industries**

With such a wide range of products, we can provide perfect solutions for so many different sectors. From super large PVC piping for massive infrastructure developments, to computer-controlled irrigation systems to aid the agricultural industries. We offer over 5000 products to customers in more than 65 countries.

**Your satisfaction is our reward**

We pride ourselves on our high-quality products that bring ultimate satisfaction to all our customers. Team this with our high level of customer service and we feel we truly do have a business we can be proud of. We have so many customers that keep returning to Elysee time and time again and we feel this speaks volumes. If you haven’t yet discovered Elysee and feel we could provide you with the products you need, do visit our website and browse our product ranges, or get in touch if you’d like any help or advice. Or expert staff are always on hand to help you choose the right products for your current project.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/elysees-characteristics/dsc2219-2.jpg',
 'Elysée Group',
 '2020-10-14T12:00:00Z',
 3,
 true),
('what-to-have-in-mind-for-effective-landscape-irrigation',
 'What to have in mind for effective landscape irrigation',
 'There are many factors in play when it comes to landscape irrigation. Ensuring your land is properly watered is vital, whether you want fully flower garden with shiny colours or simply want your lawn…',
 $md$There are many factors in play when it comes to landscape irrigation. Ensuring your land is properly watered is vital, whether you want fully flower garden with shiny colours or simply want your lawn to be lush and green. Both over and under-watering can cause a myriad of problems if you choose a wrong cheap solution, wasting money and time replacing plants, losing the garden brightness and effecting other landscape elements, such as passways, sittings areas and others. So, before you begin implementing an irrigation system, it’s a good idea to have full understanding of your requirements, and of the systems available to you.![istock-940185448.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/what-to-have-in-mind-for-effective-landscape-irrigation/istock-940185448.jpg)

Soft landscape includes two main elements Lawns & trees –shrubs –ground covers, each element needs different system to provide the needed water to the plant, so let’s take a look to know the difference between the two systems.

**Sprinkler System**

Lawns need an irrigation system to provide a big amount of water for wide-scale of green area; sprinkler system is the best way to do it.

A good sprinkler system can be highly effective. If the sprinkler locations are well planned, wastage of water due to the sprinkler hitting pathways etc. can be kept to a minimum. While a basic hose and sprinkler system is incredibly simple to set up, an in-ground sprinkler system is far superior and can even add value to your home. No longer do you have to stand around with a hose, you simply initiate the sprinkler system, or simpler still, have it on a timer or with a sensor to irrigate the ground when it is dry.

Sprinklers are suitable to be used with most types of soil, other than clay soil as the water doesn’t absorb easily into clay. They’re also compatible with the use of soluble chemicals and fertilisers. In hot countries, where large areas need to be irrigated, sprinklers can be a highly efficient method.![istock-962343970.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/what-to-have-in-mind-for-effective-landscape-irrigation/istock-962343970.jpg)

**Drip Irrigation**

Trees, shrubs & ground covers usually surrounded the lawn edge, so they need water just right under the plant; drip irrigation system is the best way to do that.

A drip irrigation system delivers water specifically to the roots, right where it is needed. It’s a targeted system, so there’s very little water wastage if the system is running correctly without any leaks. It’s not prone to water loss from evaporation and it ensures that even the bushiest of plants benefit from the water. As the water is delivered very slowly, it doesn’t pool so you don’t have issues with runoff on uneven land. Add in a sensor and you can ensure that your plants are not watered while it is raining, and extra water can be delivered when it is particularly dry. With a drip irrigation system, you can easily isolate areas so you can target those plants that require a lot of water more frequently than those that prefer a drier environment.![landscape-photo-3.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/what-to-have-in-mind-for-effective-landscape-irrigation/landscape-photo-3.jpg)

**Find all these irrigation products at Elysee**

Discover our wide range of irrigation products within the Elysee catalogue. We have many products for both drip irrigation and sprinkler systems including the latest automation technology. Whatever size or type of system you’re looking for, we’ll have just what you need.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/what-to-have-in-mind-for-effective-landscape-irrigation/istock-940185448.jpg',
 'Elysée Group',
 '2020-09-04T12:00:00Z',
 3,
 true),
('3-plastic-piping-solutions-you-should-consider',
 '3 Plastic Piping Solutions you should consider',
 'Plastic piping offers a lot of benefits over traditional metal pipes. It’s cheaper, more flexible, easy to install and far less likely to be stolen from a building site.',
 $md$Plastic piping offers a lot of benefits over traditional metal pipes. It’s cheaper, more flexible, easy to install and far less likely to be stolen from a building site. These are just some of the reasons why plastic piping has become so popular over the past few decades. When it comes to selecting the type of plastic piping that would best suit your project, you have several options that you should consider.![istock-1223842718.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/3-plastic-piping-solutions-you-should-consider/istock-1223842718.jpg)

**CPVC**

CPVC or chlorinated polyvinyl chloride piping is often used for water and waste applications. Its ability to remain stable at higher temperatures and its chlorine resistance makes it useful for both hot and cold water transport and is also commonly used in fire prevention sprinkler systems. CPVC is an inexpensive option, and both the piping and fittings are very easy to get hold of, so if you find you’re missing a vital fitting, you’ll be able to pick one up locally very quickly, without holding up your work too long. However, while CPVC is cheap, it is not very flexible, so you tend to use more fittings which increases both the expense of your installation and the risk of leaks.

**PEX**

PEX or cross-linked polyethylene has gained popularity since it was first introduced back in the 80s. Often used in heating systems, PEX is a flexible piping and most types expand in cold temperatures rather than cracking, making it a reliable option in colder climates. There are three types of PEX piping, PEX-A, PEX-B and PEX-C. PEX-A is the most flexible and the most expensive of the three types. PEX-B is slightly less flexible but a little cheaper than PEX-A and PEX-C is the cheapest option but it doesn’t have the same frost resistance as the other types and it’s also the least flexible. PEX can be a good option, but it does need specialised tools for fitting and using these tools requires some training.

**PP-R**

PP-R is another type of plastic piping developed in the 80s. It was first used in industry as it can be safely used to carry chemicals but it is now also used for heating systems as it can withstand high temperatures. The fittings require a fusion welder, so this is the trickiest of the three types of piping to install. However, PP-R does have some distinct advantages. It is very strong, it is resistant to damage from freezing and impact and unlike PEX and CPVC, it also remains stable when exposed to UV rays making it suitable for outdoor use.![istock-638096482.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/3-plastic-piping-solutions-you-should-consider/istock-638096482.jpg)

**Ease of purchase of all plastic piping**

Elysee stocks all these types of plastic piping and more. You’ll find piping of all sizes and all the fittings you’ll need too. Elysee products are made from the highest quality materials and you’ll find buying our products so quick and easy. Visit our online catalogue to find everything you need for your next piping project or get in touch if you require any advice or have any questions regarding our products.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/3-plastic-piping-solutions-you-should-consider/istock-1223842718.jpg',
 'Elysée Group',
 '2020-09-04T12:00:00Z',
 3,
 true),
('understanding-the-differences-benefits-of-pvc-cpvc-pex-pipes',
 'Understanding the Differences & Benefits of PVC, CPVC & PEX pipes',
 'As a piping material, plastic has many advantages. It’s cheap, it’s durable and it’s flexible.',
 $md$As a piping material, plastic has many advantages. It’s cheap, it’s durable and it’s flexible. In many cases plastic piping can be bent sufficiently to avoid the need for joints and so installation time can be drastically reduced. Unlike other piping such as copper, it has little scrap value, so it can also reduce the risk of site theft.

There are however, several different types of plastic piping and it’s important to understand the differences and benefits of each type so you can make an informed choice for your project. Here we take a look at three commonly used types of piping; PVC, CPVC and PEX. We’ll help you to understand how each type differs and their benefits and best use case scenarios.![istock-1138581997.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/understanding-the-differences-benefits-of-pvc-cpvc-pex-pipes/istock-1138581997.jpg)

**PVC Piping**

PVC or Polyvinyl Chloride piping has been commonly used since the 60s. This type of piping is suitable for most applications except for those involving hot water. It also has a high level of corrosion resistance making these pipes very durable and long-lasting. PVC piping is a low-cost piping so is the most cost-effective option if it serves your purpose. It should be noted though that some building codes do not allow PVC piping to be used for drinking water due to the possibility of toxins being released when the pipes are exposed to UV. However, PVC is a great choice for sink, bath and toilet drains.

**CPVC Piping**

Unlike PVC, CPVC or Chlorinated Polyvinyl Chloride piping is suitable for use with hot water systems. CPVC is strong and sturdy, it can tolerate high temperatures and is not affected by high levels of chlorine in the water passing through it. As with PVC, CPVC is also resistant to corrosion. CPVC however, is rather rigid, so while it will have more flexibility than metal pipes, there are other solutions available if you need extra flexibility for your application. It is wise to note though that CPVC can crack if water freezes within the pipes, so it’s best suited to indoor applications only.

**PEX Piping**

The most commonly used flexible solution that is suitable for both and hot and cold water distribution is PEX or Cross-linked Polyethylene piping. This piping works well with high temperature water and offers more flexibility than CPVC pipes. It is this flexibility that makes PEX so popular, it can literally snake around corners, wherever you need it to go. PEX was introduced in the 80s and has become very common due to the benefits of its flexibility. However, PEX is not rated for outdoor use due to UV exposure degradation, so should only be used for internal projects.![istock-1249038584.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/understanding-the-differences-benefits-of-pvc-cpvc-pex-pipes/istock-1249038584.jpg)

**Find the perfect piping for every project**

Elysee stocks a huge range of plastic piping, of all types and sizes. So, whatever your piping requirements, you’ll find just what you need at Elysee. Check out Elysee’s catalogue to discover all the options available, with peace of mind that all Elysee products are of the very highest quality and represent great value for money.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/understanding-the-differences-benefits-of-pvc-cpvc-pex-pipes/istock-1138581997-nhxCh.jpg',
 'Elysée Group',
 '2020-08-10T12:00:00Z',
 3,
 true),
('interesting-facts-about-the-history-and-the-future-of-irrigation',
 'Interesting Facts about the History and the Future of Irrigation',
 'Irrigation is so incredibly vital, and yet for most people, it’s largely taken for granted.',
 $md$Irrigation is so incredibly vital, and yet for most people, it’s largely taken for granted. However, ever since mankind chose to cultivate plants, irrigation systems of one type or another have been used. From the most primitive systems to the use of modern technological advancements, irrigation is an invaluable process, allowing us to grow what we want, where we want it. We can bring lush green gardens to the middle of the desert, and grow food where once no crops would ever grow. Irrigation is amazing, it helps to feed people and saves lives. It also has a very interesting history.![istock-490264723.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/interesting-facts-about-the-history-and-the-future-of-irrigation/istock-490264723.jpg)

**Irrigation dates back to Ancient Egypt**

Even back in 6000 BC, simple irrigation processes were being used. The river Nile would flood on a regular basis, and the Ancient Egyptians would divert the floodwater to the crop fields. Determining when the flood would occur was rather an art form and priests used a gauge, they called a Nilometer to observe the levels of the river.

**Shaduf Irrigation allows irrigation outside of flood periods**

Moving on to 1700 BC and a method known as Shaduf Irrigation was invented. This contraption used a rope and bucket on a crossbeam with a counterweight, to raise water from a river and swing it round to a field or water-carrying channel. Now irrigation was not reliant on flooding.

**Archimedes invents the Archimedes Screw for Irrigation**

In 250 BC the rotating screw was invented by Archimedes, to transport water up a spiral, from a source of water to higher ground. This concept is still used in industry today, but is more prevalent in transporting granular materials than liquids nowadays.![istock-1169801002.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/interesting-facts-about-the-history-and-the-future-of-irrigation/istock-1169801002.jpg)

**Centuries of Innovation**

Irrigation innovation, like any other, is an ongoing process, and so with such early beginnings, and being such an important process, it’s no surprise that irrigation techniques have improved steadily over the centuries. Modern technologies have been embraced by irrigation innovators with computerisation making irrigation more effective, less wasteful and cheaper to run.

**Moving to the future**

Whether you own a large-scale farm or you simply want to keep your garden watered, the new developments have filtered down to all levels, and so everyone can take advantage of a wide range of new products available. Automated systems are now common, saving time and man power. Now there is no need to manually go outdoors to turn systems on and off, it can all be done online, via a mobile phone app for example. When an irrigation system is set over many acres, or the land owner is not on the premises but needs to make changes to the processes then this is incredibly useful.

Moving forward, irrigation systems will become increasingly smart. You’ll be able to adjust them remotely, but they’ll also collect data. This data can then be analysed and an intelligent system can make its own decisions regarding what action should be taken. You effectively have an eye on your irrigation 24/7 with equipment that will make adjustments as and when they are needed. This could be time saving, but it could also be crop saving, if a problem is detected early.

**Discover the latest irrigation innovations at Elysee**

Elysee are a leading supplier of high-quality irrigation products. Elysee pride themselves on their thorough Research and Development programme that gives you peace of mind that all Elysee equipment is made to the very highest standards. For more information on installing or upgrading irrigation systems, visit the Elysee website or get in touch.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/interesting-facts-about-the-history-and-the-future-of-irrigation/istock-490264723.jpg',
 'Elysée Group',
 '2020-08-10T12:00:00Z',
 3,
 true),
('why-choose-elysee-s-plastic-piping-solutions',
 'Why choose Elysee''s plastic piping solutions | Elysee Cyprus',
 'Founded in 1979, Elysee has a long history of providing just the right solution for piping and irrigation needs across the world.',
 $md$Founded in 1979, **Elysee** has a long history of providing just the right solution for piping and irrigation needs across the world. Based in **Cyprus**, Elysee is a key provider of plastic piping solutions and other water supply products to more than 65 countries worldwide, aimed at making the lives of everyone who uses them more comfortable and convenient. In fact, customer satisfaction has always been the main motivator of Elysee for becoming better.

**Satisfying a plethora of needs by manufacturing solutions in 4 key areas**

**Landscape:** Elysee produces a wide variety of products for use in **landscape irrigation**. All products are the result of a careful design aimed at maximizing gains and reducing costs.

**Agriculture**: We have been helping **farmers** and **agriculture professionals** meet their goals by offering smart and cost-effective solutions that facilitate the growing process.

**Building & Infrastructure**: We design and manufacture products that can be used both for commercial and residential use whatever the size and complexity of the project. Our product range also extends to projects of **public infrastructure**, such as underground pipelines, etc.

**Industry**: The industrial sector is another area of operations in which we are also involved, offering solutions that add to the quality and overall performance of each industrial unit.

**Our decades of experience guide us to the future**

Across all of Elysee’s operations, quality has always been of paramount importance, and it is these high standards that have created an excellent reputation which the company enjoys today among our customers. Fine-tuning every aspect of the business over the decades, all inquiries are dealt with quickly and efficiently. Orders are carefully and swiftly expedited, and every product has been carefully designed and created to ensure every item you purchase has been manufactured to the very highest standards for your total peace of mind. **Elysee** understands that the service you receive as a **customer**, is as important as the products you receive, and that is why, as a business, we focus on offering the very best service alongside our superior product range.![elysee-fitting.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/why-choose-elysee-s-plastic-piping-solutions/elysee-fitting.jpg)

Constantly moving forward, enhancing and improving our business, we learn from the past and look to the future with the latest products, and making the most of leading-edge technologies to offer you the very best solutions for all your piping needs, either for water supply or irrigation infrastructure.

**An effective approach to manufacturing**

Our unique and flexible organizational structure ensures that the ultimate attention to detail is given to every process.

Our Fittings Division focuses on the production of all our fittings and accessories. With more than 3000 products in a wide range of dimensions, new products are developed every year and the team is constantly aiming towards upgrading and enhancing our current products.

No product manufacturing can stand out without innovation. To that end, we have established our very own **Research and Development** department which focuses on designing new products that are efficient, effective, easy-to-use, and eco-friendly.

Our specialized **Pipe** Division provides for all your piping needs, using the highest quality materials. You can depend on Elysee piping. Offering both **PVC** and **PE** piping in a range of sizes from 5mm to 315mm, the perfect piping for your project is made here.

Finally, our Quality Assurance Division is entirely focused on ensuring we maintain our very highest levels of quality through every level, from raw materials to end-product and aftercare support. Within this division, our dedicated team works constantly to improve and augment our product lines.![elysee-qc.jpg](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/why-choose-elysee-s-plastic-piping-solutions/elysee-qc.jpg)

**Quality leads to renowned certification**

Our dedication to high quality has led **Elysee** to be awarded many internationally renowned certificates of which we are very proud. Certification such as the WRAS, the DVGW, and the EN ISO 1452 certificate, along with many others, all go to show our dedication to fulfilling requirements and exceeding expectations.

**The benefits of plastic piping from Elysee**

Our team of expert engineers is on hand to help you with your piping needs. Plastic piping is a great choice for many projects, and **Elysee** can help you make the right decisions when it comes to ordering plastic piping for your business. More flexible than metal piping, plastic piping requires fewer joints, making the installation of the whole piping system less expensive, quicker, and more robust. Plastic does not corrode or oxidize and can also be used in conjunction with metal.

**Get in touch to discuss your requirements**

Our highly experienced staff are on-call to answer all your queries and advise you with regard to all your plastic piping needs. Just give us a call today and you’ll soon have the perfect high-quality supplies you need for your next project.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/why-choose-elysee-s-plastic-piping-solutions/teaser-k4GFv.png',
 'Elysée Group',
 '2020-07-27T12:00:00Z',
 4,
 true),
('elysee-water-irrigation-tips',
 'Elysee-Water Irrigation Tips',
 'We all use water every day, and for anyone with a garden, watering plants is vital, particularly in warm weather.',
 $md$We all use water every day, and for anyone with a garden, watering plants is vital, particularly in warm weather. A well-watered garden will provide beautiful blooms and abundant crops but using water also comes at a cost. A cost to yourself financially and a greater cost to the planet if the water is used wastefully. Here are some great tips that are so easy to implement, to ensure your garden is well watered, but using the least amount of water possible. Saving you money, and saving the environment too…

**Water deeply and less often**

Watering gently on the surface of the garden means water can quickly evaporate and you can lose a lot with run-off. Also, shallow watering encourages the plants to grow shallow roots, as of course, that’s where the water is. Deeper roots will be in soil that retains moisture better, so watering at a greater depth, less frequently, is great for reducing run-off and keeping water usage to a minimum.![plant](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/elysee-water-irrigation-tips/photo2-KunR0.png)

**Make the most of mulch**

Simply adding a layer of mulch to flower beds and around the base of trees can really make a big difference. You may usually think of mulch as a weed control method, which of course it is, but it also has the additional benefit of helping the soil to maintain moisture, lowering the rate of evaporation. If you mulch regularly, you’ll also be adding organic matter into the soil, which will help boost the moisture-retaining abilities of your soil.

**Maintain your system**

Any leaks in piping or a broken sprinkler head will cause leakage and that’s going to be very wasteful. It’s important to check your system for damage and repair or replace it straight away. The money spent on repairing a leaky hose will far outweigh the costs of wasted water over a period of time.![plant](https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/elysee-water-irrigation-tips/photo1-IVbPY.png)

**Avoid run-off**

Losing water through run-off can be kept to a minimum by a variety of methods. If you use a sprinkler, pay attention to where it is located. Try not to waste water by sprinkling areas such as driveways and paths. Make sure any drip irrigation systems that slowly and evenly distribute the water and think about collecting rainwater to use in your garden.

**Make the most of the latest innovations**

There are some amazing new technology devices you can use to ensure a low level of water wastage. For instance, with a system on a timer, you can set it to detect rain, and not turn on your system if the ground is already wet with rain. Such systems can be retro-fitted and are not as costly as you may imagine.

**Find the right products at Elysee Irrigation**

If you’re looking to repair, replace, or upgrade your irrigation system, then do visit Elysee’s website. With a large selection of irrigation products, including the latest smart technologies, you’ll always find just what you need. Eco-friendly, easy\-to\-install solutions at great value prices.$md$,
 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/elysee-water-irrigation-tips/teaser.png',
 'Elysée Group',
 '2020-07-20T12:00:00Z',
 3,
 true)
on conflict (slug) do update set
  title           = excluded.title,
  excerpt         = excluded.excerpt,
  body            = excluded.body,
  cover_image     = excluded.cover_image,
  author          = excluded.author,
  published_at    = excluded.published_at,
  reading_minutes = excluded.reading_minutes,
  is_published    = excluded.is_published,
  updated_at      = now();
