// ============================================
// PixabAnimation — Contact Page
// ============================================

const ContactPage = {
  render() {
    const content = document.getElementById('pageContent');

    // Remove any previous contact schema to avoid accumulation
    const oldSchema = document.getElementById('contactSchema');
    if (oldSchema) oldSchema.remove();

    // Inject Organization + ContactPoint structured data
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': 'https://pixabanimation.github.io/#organization',
      'name': 'PixabAnimation',
      'url': 'https://pixabanimation.github.io/',
      'logo': 'https://pixabanimation.github.io/assets/pixabanimation-logo.png',
      'description': 'Premium marketplace for motion graphics, animation assets, 4K video clips, and professional editing templates for creators worldwide.',
      'foundingDate': '2025',
      'email': 'spurno@icloud.com',
      'telephone': '+8801521211774',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Dhanmondi 32',
        'addressLocality': 'Dhaka',
        'addressCountry': 'BD'
      },
      'sameAs': [
        'https://facebook.com/pixabanimation',
        'https://twitter.com/pixabanimation',
        'https://instagram.com/pixabanimation',
        'https://pinterest.com/pixabanimation',
        'https://youtube.com/@pixabanimation'
      ],
      'contactPoint': [
        {
          '@type': 'ContactPoint',
          'telephone': '+8801521211774',
          'contactType': 'customer support',
          'email': 'spurno@icloud.com',
          'availableLanguage': ['English']
        },
        {
          '@type': 'ContactPoint',
          'telephone': '+8801521211774',
          'contactType': 'sales',
          'email': 'any_dj@icloud.com',
          'availableLanguage': ['English']
        }
      ],
      'openingHoursSpecification': [
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          'opens': '09:00',
          'closes': '18:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': 'Saturday',
          'opens': '10:00',
          'closes': '16:00'
        }
      ]
    };

    const schemaScript = document.createElement('script');
    schemaScript.id = 'contactSchema';
    schemaScript.type = 'application/ld+json';
    schemaScript.textContent = JSON.stringify(organizationSchema);
    document.head.appendChild(schemaScript);

    content.innerHTML = `
      <div class="contact-page page-enter">
        <div style="text-align:center;margin-bottom:40px">
          <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;background:rgba(0,102,204,0.1);border:1px solid rgba(0,102,204,0.15);border-radius:9999px;margin-bottom:16px">
            <span style="width:6px;height:6px;border-radius:50%;background:var(--ds-primary)"></span>
            <span class="ds-caption" style="font-weight:500;color:var(--ds-primary)">Get in Touch</span>
          </div>
          <h1 class="ds-display-lg" style="color:#1d1d1f;margin-bottom:10px">We'd Love to <span class="text-gradient">Hear</span> From You</h1>
          <p class="ds-body" style="color:rgba(0,0,0,0.56);max-width:480px;margin:0 auto">Have a question, feedback, or just want to say hello? We're here for you.</p>
        </div>
        
        <div class="contact-grid">
          <div class="contact-info-cards" style="gap:12px">
            <div class="contact-info-card" style="padding:20px;border:1px solid rgba(0,0,0,0.06);border-radius:14px">
              <div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:1rem;color:var(--ds-primary);flex-shrink:0"><i class="fas fa-map-marker-alt"></i></div>
              <div class="contact-info-text">
                <h4 class="ds-caption-strong" style="color:#1d1d1f;margin-bottom:4px">Visit Us</h4>
                <p class="ds-caption" style="color:rgba(0,0,0,0.50);line-height:1.5">Dhanmondi 32, Dhaka, Bangladesh.</p>
              </div>
            </div>
            <div class="contact-info-card" style="display:flex;gap:14px;align-items:flex-start;padding:20px;border:1px solid rgba(0,0,0,0.06);border-radius:14px">
              <div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:1rem;color:var(--ds-primary);flex-shrink:0"><i class="fas fa-envelope"></i></div>
              <div class="contact-info-text">
                <h4 class="ds-caption-strong" style="color:#1d1d1f;margin-bottom:4px">Email Us</h4>
                <p class="ds-caption" style="color:rgba(0,0,0,0.50);line-height:1.5">spurno@icloud.com<br>any_dj@icloud.com</p>
              </div>
            </div>
            <div class="contact-info-card" style="display:flex;gap:14px;align-items:flex-start;padding:20px;border:1px solid rgba(0,0,0,0.06);border-radius:14px">
              <div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:1rem;color:var(--ds-primary);flex-shrink:0"><i class="fas fa-phone-alt"></i></div>
              <div class="contact-info-text">
                <h4 class="ds-caption-strong" style="color:#1d1d1f;margin-bottom:4px">Call Us</h4>
                <p class="ds-caption" style="color:rgba(0,0,0,0.50);line-height:1.5">+880 1521211774<br>Mon-Fri, 9AM-6PM EST</p>
              </div>
            </div>
            <div class="contact-info-card" style="display:flex;gap:14px;align-items:flex-start;padding:20px;border:1px solid rgba(0,0,0,0.06);border-radius:14px">
              <div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:1rem;color:var(--ds-primary);flex-shrink:0"><i class="fas fa-clock"></i></div>
              <div class="contact-info-text">
                <h4 class="ds-caption-strong" style="color:#1d1d1f;margin-bottom:4px">Business Hours</h4>
                <p class="ds-caption" style="color:rgba(0,0,0,0.50);line-height:1.5">Monday - Friday: 9AM - 6PM<br>Saturday: 10AM - 4PM<br>Sunday: Closed</p>
              </div>
            </div>
          </div>

          <div class="contact-form-wrapper">
            <h3 class="ds-body-strong" style="color:#1d1d1f;margin-bottom:20px">Send us a Message</h3>
            <form class="contact-form" onsubmit="ContactPage.submit(event)" style="gap:14px">
              <div class="contact-name-row">
                <div class="form-group">
                  <label class="ds-caption" style="color:rgba(0,0,0,0.50);margin-bottom:4px;display:block">Your Name</label>
                  <input type="text" id="contactName" placeholder="Full name" required>
                </div>
                <div class="form-group">
                  <label class="ds-caption" style="color:rgba(0,0,0,0.50);margin-bottom:4px;display:block">Your Email</label>
                  <input type="email" id="contactEmail" placeholder="youremail@gmail.com" required>
                </div>
              </div>
              <div class="form-group">
                <label class="ds-caption" style="color:rgba(0,0,0,0.50);margin-bottom:4px;display:block">Subject</label>
                <input type="text" id="contactSubject" placeholder="How can we help?" required>
              </div>
              <div class="form-group">
                <label class="ds-caption" style="color:rgba(0,0,0,0.50);margin-bottom:4px;display:block">Message</label>
                <textarea id="contactMessage" rows="5" placeholder="Tell us more about your inquiry..." required style="resize:vertical"></textarea>
              </div>
              <button type="submit" class="ds-pill-cta" style="align-self:flex-start;padding:12px 28px;font-size:15px">
                <i class="fas fa-paper-plane"></i> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  async submit(event) {
    event.preventDefault();
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value;

    try {
      await DB.submitContact(name, email, subject, message);
      Components.toast('Message sent! We\'ll get back to you soon.', 'success');
      event.target.reset();
    } catch (error) {
      Components.toast('Failed to send message. Please try again.', 'error');
    }
  }
};
