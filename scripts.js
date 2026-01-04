// Simple JS for form UX and basic accessibility
document.addEventListener('DOMContentLoaded',function(){
  // Smooth scroll for anchors
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor){
    anchor.addEventListener('click',function(e){
      var target = document.querySelector(this.getAttribute('href'));
      if(target){
        e.preventDefault();
        var headerOffset = document.querySelector('.site-header') ? document.querySelector('.site-header').offsetHeight : 0;
        var rect = target.getBoundingClientRect();
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var offsetPosition = rect.top + scrollTop - headerOffset - 12; // small gap
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        history.replaceState(null,'',this.getAttribute('href'));
      }
    });
  });

  // Simple form submit handler to disable button after submit
  var form = document.querySelector('form[name="contact"]');
  if(form){
    form.addEventListener('submit',function(){
      var btn = form.querySelector('button[type="submit"]');
      if(btn){btn.disabled=true;btn.textContent='Sending...';}
    });
  }

  // Header scrolled state and set CSS header height variable
  var header = document.querySelector('.site-header');
  var contactSection = document.querySelector('#contact');
  var heroSection = document.querySelector('.hero');
  if(header){
    var setHeaderHeight = function(){
      document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
    };
    setHeaderHeight();
    window.addEventListener('resize', setHeaderHeight);

    // initial transparent if over hero
    var checkHeaderState = function(){
      var scrollY = window.scrollY || window.pageYOffset;
      var heroBottom = heroSection ? (heroSection.offsetTop + heroSection.offsetHeight) : 0;
      var contactTop = contactSection ? contactSection.offsetTop : Infinity;

      // transparent over hero
      if(scrollY < heroBottom - 10){
        header.classList.add('transparent');
        header.classList.remove('scrolled');
      } else {
        header.classList.remove('transparent');
      }

      // shadow when scrolled down past hero
      if(scrollY > heroBottom + 10){ header.classList.add('scrolled'); } else { header.classList.remove('scrolled'); }

      // hide header when at contact section
      if(scrollY >= contactTop - header.offsetHeight - 20){ header.classList.add('hidden'); } else { header.classList.remove('hidden'); }
    };

    window.addEventListener('scroll', checkHeaderState);
    checkHeaderState();
  }
});

// Formspree submission handler for Cloudflare Pages
(function () {
  // Replace with your Formspree form endpoint (e.g. https://formspree.io/f/xyz123)
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mnjngeoy';

  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Honeypot check
    const botField = form.querySelector('[name="bot-field"]');
    if (botField && botField.value) return; // likely spam

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : null;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    try {
      const formData = new FormData(form);

      const resp = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (resp.ok) {
        // Successful submission
        window.location.href = '/thank-you.html';
        return;
      }

      // Handle non-OK response
      let errMsg = 'There was a problem submitting the form. Please try again later.';
      try {
        const json = await resp.json();
        if (json && json.error) errMsg = json.error;
      } catch (_) {}

      alert(errMsg);

    } catch (err) {
      alert('Network error. Please check your connection and try again.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText || 'Get a Quote';
      }
    }
  });
})();
