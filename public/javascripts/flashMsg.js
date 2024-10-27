// // For flash message pop up (Bootstrap toasts)

document.addEventListener('DOMContentLoaded', function () {
    const toastTrigger = document.getElementById('liveToastBtn');
    const toastLiveExample = document.getElementById('liveToast');
  
    if (toastTrigger && toastLiveExample) {
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
        toastTrigger.addEventListener('click', () => {
            toastBootstrap.show();
        });
        
        // Automatically trigger the toast if there's a success message
        if (toastTrigger.style.display === 'none') {
            toastTrigger.click();
        }
    }
  });