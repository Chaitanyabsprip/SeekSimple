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
precision mediump float;
uniform mat4 u_MVPMatrix;
uniform bool dynamic;
uniform bool flipped;
uniform int colorsUsed;
attribute vec4 a_Position;
attribute vec2 a_TexCoordinate;
varying vec2 v_TexCoordinate;
varying vec2 u_TexCoordinate;

void main() {
    if (dynamic){
        float percent = float(colorsUsed) / 256.0;
        vec2 tex_Coord = vec2(a_TexCoordinate.x * percent, a_TexCoordinate.y * percent);
        v_TexCoordinate = tex_Coord + vec2((256.0 - float(colorsUsed)) / 512.0, 0.0);
        if (flipped){
            v_TexCoordinate = vec2(1.0 - v_TexCoordinate.x, v_TexCoordinate.y);
        }
    } else {
        v_TexCoordinate = a_TexCoordinate;
        if (flipped){
            v_TexCoordinate = vec2(1.0 - v_TexCoordinate.x, v_TexCoordinate.y);
        }
    }
    u_TexCoordinate = a_TexCoordinate;
    gl_Position = u_MVPMatrix * a_Position;
}

