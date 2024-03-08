const fragmentShader = `
    uniform vec4 vColor;

    void main() {
        gl_FragColor = vColor;
    }
`;

export default fragmentShader