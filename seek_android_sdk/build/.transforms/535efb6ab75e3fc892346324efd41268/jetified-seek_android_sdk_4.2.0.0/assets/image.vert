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
uniform vec2 windowSize;
uniform vec2 offset;
uniform float scale;
uniform float visibleRotation;
uniform float thermalRotation;
uniform bool flipVisibleHorizontal;
vec2 rescale(float degrees, vec2 tx){
    if(degrees == 180.0 || degrees == 0.0){
        float aspectRatio = windowSize.x / windowSize.y;
        return tx * (aspectRatio > 1.0 ? vec2(1.0 / aspectRatio, aspectRatio) : vec2(aspectRatio, 1.0 / aspectRatio));
    } else {
        return tx;
    }
}

vec2 rotTexAroundCenter(float degrees, vec2 tx) {
    vec2 rotationCenter = vec2(0.5);
    float radians = radians(degrees);
    return rescale(degrees, mat2(cos(radians), sin(radians), -sin(radians), cos(radians)) * (tx - rotationCenter) + rotationCenter);
}

void main() {
    gl_Position = u_MVPMatrix * a_Position;
    v_texCoord = (rotTexAroundCenter(visibleRotation, a_TexCoordinate) / scale) + offset;
    if(flipVisibleHorizontal){
        v_texCoord.y = 1.0 - v_texCoord.y;
    }
    t_texCoord = rotTexAroundCenter(thermalRotation, a_TexCoordinate);
}
