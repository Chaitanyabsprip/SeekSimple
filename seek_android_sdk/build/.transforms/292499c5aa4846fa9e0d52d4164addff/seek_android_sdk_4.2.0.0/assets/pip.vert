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
attribute vec4 a_Position;
attribute vec2 a_TexCoordinate;
varying vec2 v_texCoord;
varying vec2 t_texCoord;
uniform float aspectRatio;
uniform float imageAspectRatio;
uniform vec2 offset;
uniform float scale;
// only works for 0 and 180, currently unused
// uniform float thermalRotation;
// only works for 0 and 180
uniform float visibleRotation;
uniform float thermalRotation;
uniform bool flipVisibleHorizontal;
vec2 rescale(vec2 tx){
    if(aspectRatio > imageAspectRatio){
        return vec2(tx.x, tx.y * imageAspectRatio / aspectRatio);
    } else {
        return vec2(tx.x * aspectRatio / imageAspectRatio, tx.y);
    }
}

vec2 rotTexAroundCenter(float degrees, vec2 tx) {
    vec2 rotationOffset = vec2(0.5);
    float radians = radians(degrees);
    return rescale(mat2(cos(radians), sin(radians), -sin(radians), cos(radians)) * (tx - rotationOffset) + rotationOffset);
}

void main() {
    // TODO: Fix visible alignment for PIP in non-4:3 aspect ratios
    gl_Position = u_MVPMatrix * a_Position;
    vec2 texCoord = rotTexAroundCenter(visibleRotation, a_TexCoordinate / scale + offset);
    v_texCoord = texCoord;
    if(flipVisibleHorizontal){
        v_texCoord.y = 1.0 - v_texCoord.y;
    }
    t_texCoord = rotTexAroundCenter(thermalRotation, a_TexCoordinate);
}
