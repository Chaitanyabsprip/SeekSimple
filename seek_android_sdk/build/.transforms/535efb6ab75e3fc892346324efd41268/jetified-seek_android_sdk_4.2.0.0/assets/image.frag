//
// SEEK THERMAL CONFIDENTIAL
// _________________________
//
// Copyright (c) 2019 Seek Thermal Incorporated
// All Rights Reserved.
//
// NOTICE:  All information contained herein is, and remains
// the property of Seek Thermal Incorporated and its suppliers,
// if any.  The intellectual and technical concepts contained
// herein are proprietary to Seek Thermal Incorporated
// and its suppliers and may be covered by U.S. and Foreign Patents,
// patents in process, and are protected by trade secret or copyright law.
// Dissemination of this information or reproduction of this material
// is strictly forbidden unless prior written permission is obtained
// from Seek Thermal Incorporated.
//
#extension GL_OES_EGL_image_external : require

precision mediump float;
varying vec2 v_texCoord;
varying vec2 t_texCoord;
uniform sampler2D t_texture;
uniform samplerExternalOES v_texture;
uniform sampler2D vb_texture;
uniform vec2 windowSize;
uniform int mode;
uniform int sobelMode;
uniform vec4 innerEdgeColor;
uniform vec4 outerEdgeColor;
uniform float colorsUsed;
uniform vec2 offset;
uniform float scale;
uniform float sobelScale;
uniform float alphaBlendRatio;
uniform bool isVisibleColor;
uniform int fusionControl;
uniform vec4 windowRect;
uniform bool pipControl;
uniform bool windowControl;
uniform vec4 color;
// true if you should use the visible texture (samplerExternalOES),
// false if you should use the visible bitmap (sampler2D)
uniform bool useVisibleTexture;

void draw_visible_image(in vec3 v_tex){
    gl_FragColor = vec4(v_tex, 1.0);
}

void main(void)
{
    vec3 v_tex;
    if(useVisibleTexture){
        v_tex = texture2D(v_texture, v_texCoord).rgb;
    } else{
        v_tex = texture2D(vb_texture, v_texCoord).rgb;
    }
    vec3 luminanceWeighting = vec3(0.2125, 0.7154, 0.0721);
    if (mode == 0){
        // Infrared Mode
        gl_FragColor = vec4(texture2D(t_texture, t_texCoord).rgb, 1.0) * color;
    }
    if (mode == 1) {
        // Fusion Mode
        if(fusionControl == 1){
            // sobel edge mode
            float kernel[9];
            float largerKernel[9];
            float w = 1.0 / windowSize.x;
            float h = 1.0 / windowSize.y;
            float lw = 2.0 / windowSize.x;
            float lh = 2.0 / windowSize.y;
            // make kernel for inner sobel
            if (useVisibleTexture){
                kernel[0] = dot(texture2D(v_texture, v_texCoord + vec2(-w, -h)).rgb, luminanceWeighting);
                kernel[1] = dot(texture2D(v_texture, v_texCoord + vec2(0.0, -h)).rgb, luminanceWeighting);
                kernel[2] = dot(texture2D(v_texture, v_texCoord + vec2(w, -h)).rgb, luminanceWeighting);
                kernel[3] = dot(texture2D(v_texture, v_texCoord + vec2(-w, 0.0)).rgb, luminanceWeighting);
                kernel[4] = dot(texture2D(v_texture, v_texCoord).rgb, luminanceWeighting);
                kernel[5] = dot(texture2D(v_texture, v_texCoord + vec2(w, 0.0)).rgb, luminanceWeighting);
                kernel[6] = dot(texture2D(v_texture, v_texCoord + vec2(-w, h)).rgb, luminanceWeighting);
                kernel[7] = dot(texture2D(v_texture, v_texCoord + vec2(0.0, h)).rgb, luminanceWeighting);
                kernel[8] = dot(texture2D(v_texture, v_texCoord + vec2(w, h)).rgb, luminanceWeighting);
            } else {
                kernel[0] = dot(texture2D(vb_texture, v_texCoord + vec2(-w, -h)).rgb, luminanceWeighting);
                kernel[1] = dot(texture2D(vb_texture, v_texCoord + vec2(0.0, -h)).rgb, luminanceWeighting);
                kernel[2] = dot(texture2D(vb_texture, v_texCoord + vec2(w, -h)).rgb, luminanceWeighting);
                kernel[3] = dot(texture2D(vb_texture, v_texCoord + vec2(-w, 0.0)).rgb, luminanceWeighting);
                kernel[4] = dot(texture2D(vb_texture, v_texCoord).rgb, luminanceWeighting);
                kernel[5] = dot(texture2D(vb_texture, v_texCoord + vec2(w, 0.0)).rgb, luminanceWeighting);
                kernel[6] = dot(texture2D(vb_texture, v_texCoord + vec2(-w, h)).rgb, luminanceWeighting);
                kernel[7] = dot(texture2D(vb_texture, v_texCoord + vec2(0.0, h)).rgb, luminanceWeighting);
                kernel[8] = dot(texture2D(vb_texture, v_texCoord + vec2(w, h)).rgb, luminanceWeighting);
            }
            // make larger kernel for outer sobel
            if (useVisibleTexture){
                largerKernel[0] = dot(texture2D(v_texture, v_texCoord + vec2(-lw, -lh)).rgb, luminanceWeighting);
                largerKernel[1] = dot(texture2D(v_texture, v_texCoord + vec2(0.0, -lh)).rgb, luminanceWeighting);
                largerKernel[2] = dot(texture2D(v_texture, v_texCoord + vec2(lw, -lh)).rgb, luminanceWeighting);
                largerKernel[3] = dot(texture2D(v_texture, v_texCoord + vec2(-lw, 0.0)).rgb, luminanceWeighting);
                largerKernel[4] = dot(texture2D(v_texture, v_texCoord).rgb, luminanceWeighting);
                largerKernel[5] = dot(texture2D(v_texture, v_texCoord + vec2(lw, 0.0)).rgb, luminanceWeighting);
                largerKernel[6] = dot(texture2D(v_texture, v_texCoord + vec2(-lw, lh)).rgb, luminanceWeighting);
                largerKernel[7] = dot(texture2D(v_texture, v_texCoord + vec2(0.0, lh)).rgb, luminanceWeighting);
                largerKernel[8] = dot(texture2D(v_texture, v_texCoord + vec2(lw, lh)).rgb, luminanceWeighting);
            } else {
                largerKernel[0] = dot(texture2D(vb_texture, v_texCoord + vec2(-lw, -lh)).rgb, luminanceWeighting);
                largerKernel[1] = dot(texture2D(vb_texture, v_texCoord + vec2(0.0, -lh)).rgb, luminanceWeighting);
                largerKernel[2] = dot(texture2D(vb_texture, v_texCoord + vec2(w, -lh)).rgb, luminanceWeighting);
                largerKernel[3] = dot(texture2D(vb_texture, v_texCoord + vec2(-lw, 0.0)).rgb, luminanceWeighting);
                largerKernel[4] = dot(texture2D(vb_texture, v_texCoord).rgb, luminanceWeighting);
                largerKernel[5] = dot(texture2D(vb_texture, v_texCoord + vec2(lw, 0.0)).rgb, luminanceWeighting);
                largerKernel[6] = dot(texture2D(vb_texture, v_texCoord + vec2(-lw, lh)).rgb, luminanceWeighting);
                largerKernel[7] = dot(texture2D(vb_texture, v_texCoord + vec2(0.0, lh)).rgb, luminanceWeighting);
                largerKernel[8] = dot(texture2D(vb_texture, v_texCoord + vec2(lw, lh)).rgb, luminanceWeighting);
            }
            float sobel_edge_h = kernel[2] + (2.0*kernel[5]) + kernel[8] - (kernel[0] + (2.0*kernel[3]) + kernel[6]);
            float sobel_edge_v = kernel[0] + (2.0*kernel[1]) + kernel[2] - (kernel[6] + (2.0*kernel[7]) + kernel[8]);
            float larger_sobel_edge_h = largerKernel[2] + (2.0*largerKernel[5]) + largerKernel[8] - (largerKernel[0] + (2.0*largerKernel[3]) + largerKernel[6]);
            float larger_sobel_edge_v = largerKernel[0] + (2.0*largerKernel[1]) + largerKernel[2] - (largerKernel[6] + (2.0*largerKernel[7]) + largerKernel[8]);
            float sobel = sqrt((sobel_edge_h * sobel_edge_h) + (sobel_edge_v * sobel_edge_v));
            float larger_sobel = sqrt((larger_sobel_edge_h * larger_sobel_edge_h) + (larger_sobel_edge_v * larger_sobel_edge_v));
            if(sobelMode == 0){
                // white
                gl_FragColor = vec4(vec3(sobel) * sobelScale, 1.0) + texture2D(t_texture, t_texCoord);
            } else if (sobelMode == 1){
                // black
                gl_FragColor = -vec4(vec3(sobel) * sobelScale, 1.0) + texture2D(t_texture, t_texCoord);
            } else if (sobelMode == 2){
                // white and black
                gl_FragColor = -vec4(vec3(sobel) * sobelScale, 1.0) + vec4(vec3(larger_sobel) * sobelScale, 1.0) + texture2D(t_texture, t_texCoord);
            } else if (sobelMode == 3){
                gl_FragColor = vec4(vec3(sobel) * sobelScale, 1.0) - vec4(vec3(larger_sobel) * sobelScale, 1.0) + texture2D(t_texture, t_texCoord);
            } else if (sobelMode == 4){
                // custom
                gl_FragColor = -vec4(vec3(sobel) * (vec3(1.0) - innerEdgeColor.rgb) * sobelScale, 1.0) + vec4(vec3(larger_sobel) * outerEdgeColor.rgb * sobelScale, 1.0) + texture2D(t_texture, t_texCoord);
            }
        } else if (fusionControl == 0){
            // alpha blend mode
            if (isVisibleColor){
                gl_FragColor = vec4(alphaBlendRatio * texture2D(t_texture, t_texCoord).rgb,
                alphaBlendRatio) + vec4((1.0 - alphaBlendRatio) * v_tex,
                1.0 - alphaBlendRatio);
            } else {
                gl_FragColor = vec4(alphaBlendRatio * texture2D(t_texture, t_texCoord).rgb,
                alphaBlendRatio) + vec4((1.0 - alphaBlendRatio) * vec3(dot(v_tex,
                luminanceWeighting)), 1.0 - alphaBlendRatio);
            }
        } else {
            // both
            float kernel[9];
            float largerKernel[9];
            float w = 1.0 / windowSize.x;
            float h = 1.0 / windowSize.y;
            float lw = 2.0 / windowSize.x;
            float lh = 2.0 / windowSize.y;
            // make kernel for inner sobel
            if (useVisibleTexture){
                kernel[0] = dot(texture2D(v_texture, v_texCoord + vec2(-w, -h)).rgb, luminanceWeighting);
                kernel[1] = dot(texture2D(v_texture, v_texCoord + vec2(0.0, -h)).rgb, luminanceWeighting);
                kernel[2] = dot(texture2D(v_texture, v_texCoord + vec2(w, -h)).rgb, luminanceWeighting);
                kernel[3] = dot(texture2D(v_texture, v_texCoord + vec2(-w, 0.0)).rgb, luminanceWeighting);
                kernel[4] = dot(texture2D(v_texture, v_texCoord).rgb, luminanceWeighting);
                kernel[5] = dot(texture2D(v_texture, v_texCoord + vec2(w, 0.0)).rgb, luminanceWeighting);
                kernel[6] = dot(texture2D(v_texture, v_texCoord + vec2(-w, h)).rgb, luminanceWeighting);
                kernel[7] = dot(texture2D(v_texture, v_texCoord + vec2(0.0, h)).rgb, luminanceWeighting);
                kernel[8] = dot(texture2D(v_texture, v_texCoord + vec2(w, h)).rgb, luminanceWeighting);
            } else {
                kernel[0] = dot(texture2D(vb_texture, v_texCoord + vec2(-w, -h)).rgb, luminanceWeighting);
                kernel[1] = dot(texture2D(vb_texture, v_texCoord + vec2(0.0, -h)).rgb, luminanceWeighting);
                kernel[2] = dot(texture2D(vb_texture, v_texCoord + vec2(w, -h)).rgb, luminanceWeighting);
                kernel[3] = dot(texture2D(vb_texture, v_texCoord + vec2(-w, 0.0)).rgb, luminanceWeighting);
                kernel[4] = dot(texture2D(vb_texture, v_texCoord).rgb, luminanceWeighting);
                kernel[5] = dot(texture2D(vb_texture, v_texCoord + vec2(w, 0.0)).rgb, luminanceWeighting);
                kernel[6] = dot(texture2D(vb_texture, v_texCoord + vec2(-w, h)).rgb, luminanceWeighting);
                kernel[7] = dot(texture2D(vb_texture, v_texCoord + vec2(0.0, h)).rgb, luminanceWeighting);
                kernel[8] = dot(texture2D(vb_texture, v_texCoord + vec2(w, h)).rgb, luminanceWeighting);
            }
            // make larger kernel for outer sobel
            if (useVisibleTexture){
                largerKernel[0] = dot(texture2D(v_texture, v_texCoord + vec2(-lw, -lh)).rgb, luminanceWeighting);
                largerKernel[1] = dot(texture2D(v_texture, v_texCoord + vec2(0.0, -lh)).rgb, luminanceWeighting);
                largerKernel[2] = dot(texture2D(v_texture, v_texCoord + vec2(lw, -lh)).rgb, luminanceWeighting);
                largerKernel[3] = dot(texture2D(v_texture, v_texCoord + vec2(-lw, 0.0)).rgb, luminanceWeighting);
                largerKernel[4] = dot(texture2D(v_texture, v_texCoord).rgb, luminanceWeighting);
                largerKernel[5] = dot(texture2D(v_texture, v_texCoord + vec2(lw, 0.0)).rgb, luminanceWeighting);
                largerKernel[6] = dot(texture2D(v_texture, v_texCoord + vec2(-lw, lh)).rgb, luminanceWeighting);
                largerKernel[7] = dot(texture2D(v_texture, v_texCoord + vec2(0.0, lh)).rgb, luminanceWeighting);
                largerKernel[8] = dot(texture2D(v_texture, v_texCoord + vec2(lw, lh)).rgb, luminanceWeighting);
            } else {
                largerKernel[0] = dot(texture2D(vb_texture, v_texCoord + vec2(-lw, -lh)).rgb, luminanceWeighting);
                largerKernel[1] = dot(texture2D(vb_texture, v_texCoord + vec2(0.0, -lh)).rgb, luminanceWeighting);
                largerKernel[2] = dot(texture2D(vb_texture, v_texCoord + vec2(w, -lh)).rgb, luminanceWeighting);
                largerKernel[3] = dot(texture2D(vb_texture, v_texCoord + vec2(-lw, 0.0)).rgb, luminanceWeighting);
                largerKernel[4] = dot(texture2D(vb_texture, v_texCoord).rgb, luminanceWeighting);
                largerKernel[5] = dot(texture2D(vb_texture, v_texCoord + vec2(lw, 0.0)).rgb, luminanceWeighting);
                largerKernel[6] = dot(texture2D(vb_texture, v_texCoord + vec2(-lw, lh)).rgb, luminanceWeighting);
                largerKernel[7] = dot(texture2D(vb_texture, v_texCoord + vec2(0.0, lh)).rgb, luminanceWeighting);
                largerKernel[8] = dot(texture2D(vb_texture, v_texCoord + vec2(lw, lh)).rgb, luminanceWeighting);
            }
            float sobel_edge_h = kernel[2] + (2.0*kernel[5]) + kernel[8] - (kernel[0] + (2.0*kernel[3]) + kernel[6]);
            float sobel_edge_v = kernel[0] + (2.0*kernel[1]) + kernel[2] - (kernel[6] + (2.0*kernel[7]) + kernel[8]);
            float larger_sobel_edge_h = largerKernel[2] + (2.0*largerKernel[5]) + largerKernel[8] - (largerKernel[0] + (2.0*largerKernel[3]) + largerKernel[6]);
            float larger_sobel_edge_v = largerKernel[0] + (2.0*largerKernel[1]) + largerKernel[2] - (largerKernel[6] + (2.0*largerKernel[7]) + largerKernel[8]);
            float sobel = sqrt((sobel_edge_h * sobel_edge_h) + (sobel_edge_v * sobel_edge_v));
            float larger_sobel = sqrt((larger_sobel_edge_h * larger_sobel_edge_h) + (larger_sobel_edge_v * larger_sobel_edge_v));
            vec3 sobelEdge = (-vec4(vec3(sobel) * sobelScale, 1.0) + vec4(vec3(larger_sobel) * sobelScale, 1.0) + texture2D(t_texture, t_texCoord)).rgb;
            // alpha blend mode
            if (isVisibleColor){
                gl_FragColor = vec4(alphaBlendRatio * sobelEdge,
                alphaBlendRatio) + vec4((1.0 - alphaBlendRatio) * v_tex,
                1.0 - alphaBlendRatio);
            } else {
                gl_FragColor = vec4(alphaBlendRatio * sobelEdge,
                alphaBlendRatio) + vec4((1.0 - alphaBlendRatio) * vec3(dot(v_tex,
                luminanceWeighting)), 1.0 - alphaBlendRatio);
            }
        }
    } else if (mode == 2){
        // Picture in a Picture Mode
        // draw the bigger picture, the smaller one is handled in a separate shader
        if(pipControl){
            // big thermal, small visible
            gl_FragColor = texture2D(t_texture, t_texCoord);
        } else {
            // big visible, small thermal
            draw_visible_image(v_tex);
        }
    } else if (mode == 3){
        // window mode
        if(t_texCoord.x > windowRect.x && t_texCoord.x < windowRect.z &&
            t_texCoord.y > windowRect.y && t_texCoord.y < windowRect.w){
            if(windowControl){
                draw_visible_image(v_tex);
            } else {
                gl_FragColor = texture2D(t_texture, t_texCoord);
            }
        } else {
            if(windowControl){
                gl_FragColor = texture2D(t_texture, t_texCoord);
            } else {
                draw_visible_image(v_tex);
            }
        }
    }
}