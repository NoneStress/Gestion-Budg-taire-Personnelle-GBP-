document.addEventListener('DOMContentLoaded', function() {
    const gradientType = document.getElementById('gradient-type');
    const direction = document.getElementById('direction');
    const color1 = document.getElementById('color1');
    const color2 = document.getElementById('color2');
    const addColorBtn = document.getElementById('add-color');
    const preview = document.getElementById('gradient-preview');
    const cssCode = document.getElementById('css-code');
    const exportBtn = document.getElementById('export-btn');

    let colors = [color1.value, color2.value];

    function updateGradient() {
        const type = gradientType.value;
        const dir = direction.value;
        let css;

        if (type === 'linear') {
            css = `linear-gradient(${dir}, ${colors.join(', ')})`;
        } else {
            css = `radial-gradient(${colors.join(', ')})`;
        }

        preview.style.background = css;
        cssCode.value = `background: ${css};`;
    }

    function updateColors() {
        colors = [color1.value, color2.value];
        // Add more if dynamic inputs added
        updateGradient();
    }

    gradientType.addEventListener('change', updateGradient);
    direction.addEventListener('change', updateGradient);
    color1.addEventListener('input', updateColors);
    color2.addEventListener('input', updateColors);

    // Add color functionality (simple: add to colors array, but no UI yet)
    addColorBtn.addEventListener('click', function() {
        // For now, just add a default color
        colors.push('#00ff00');
        updateGradient();
    });

    exportBtn.addEventListener('click', function() {
        const cssContent = cssCode.value;
        const blob = new Blob([cssContent], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gradient.css';
        a.click();
        URL.revokeObjectURL(url);
    });

    // Initial update
    updateGradient();
});