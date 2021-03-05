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
uniform bool isThermal;
uniform bool useVisibleTexture;
uniform vec4 color;

void main() {
    if(isThermal){
        gl_FragColor = texture2D(t_texture, t_texCoord) * color;
    } else {
        if(useVisibleTexture){
            gl_FragColor = texture2D(v_texture, v_texCoord) * color;
        } else {
            gl_FragColor = texture2D(vb_texture, v_texCoord) * color;
        }
    }
}
