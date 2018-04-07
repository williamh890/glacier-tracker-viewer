precision mediump float;

uniform sampler2D u_image;
uniform float max_velocity;
uniform float delta;

varying vec2 v_texCoord;


void main() {
    vec4 lookup = texture2D(u_image, v_texCoord);

    float vel = dot( lookup, vec4(1.0, 1./255.0, 1./65025.0, 1./16581375.0) );

    vel = clamp(vel, 0., max_velocity) / max_velocity;

    vec4 max_color = vec4(252., 253., 164., 255.) / 255.;
    vec4 min_color = vec4(0., 53., 110., 255.) / 255.;

    vec4 out_color = mix(min_color, max_color, vel);

    if (vel < delta && vel > -delta) {
        out_color.a = 0.;
    }

    gl_FragColor = out_color;
}
