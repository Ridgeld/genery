// utils/loadScript.js
export function loadScripts(scripts, callback) {
    const loadScript = (index) => {
        if (index >= scripts.length) {
            callback();
            return;
        }

        const script = document.createElement('script');
        script.src = scripts[index];
        script.async = true;
        script.onload = () => loadScript(index + 1);
        document.body.appendChild(script);
    };

    loadScript(0);
}
