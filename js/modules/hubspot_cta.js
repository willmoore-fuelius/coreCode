document.addEventListener('DOMContentLoaded', function(){

  const ctaItems = document.querySelectorAll('.js-cta__icon');

  if(ctaItems.length > 0){
    setTimeout(function(){
      ctaItems.forEach(function(ctaItem){
        const icon = ctaItem.querySelector('i');

        if(icon){
          const id = ctaItem.getAttribute('id');

          if(id && id.length > 0){
            const alignment = icon.dataset.iconAlignment;
            const anchor = document.querySelector('#' + id + ' a');
            const label = anchor ? anchor.textContent : '';

            if(anchor){
              // Preserve accessible name for screen readers
              const ariaLabel = anchor.getAttribute('aria-label') || label;

              if(alignment === 'right'){
                anchor.innerHTML = label + icon.outerHTML;
              } else {
                anchor.innerHTML = icon.outerHTML + label;
              }

              // Mark decorative icon as hidden from assistive technology
              const insertedIcon = anchor.querySelector('i');
              if(insertedIcon){
                insertedIcon.setAttribute('aria-hidden', 'true');
              }

              // Restore accessible label
              anchor.setAttribute('aria-label', ariaLabel);
            }
          }

          icon.remove();
        }
      });
    }, 1000);
  }
});
