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
uniform sampler2D u_Texture;
uniform vec4 color;
uniform vec2 size;
uniform vec4 borderColor;
uniform float borderSize;
uniform bool roundedEdges;
varying vec2 v_TexCoordinate;
varying vec2 u_TexCoordinate;

void main() {
    float xBorderSize = borderSize * size.x / size.y;
    float radius = 0.5 - borderSize;
    float unscaledRadius = radius * size.x / size.y;
    float x = (u_TexCoordinate.x) * size.y / size.x - radius - borderSize;
    float y = (u_TexCoordinate.y - 0.5);
    float x2 = (1.0 - u_TexCoordinate.x) * size.y / size.x - radius - borderSize;
    float y2 = (1.0 - u_TexCoordinate.y - 0.5);
    float distance = x * x + y * y;
    float distance2 = x2 * x2 + y2 * y2;

    float borderRadius = 0.5;
    float borderX = (u_TexCoordinate.x) * size.y / size.x - borderRadius;
    float borderY = (u_TexCoordinate.y - borderRadius);
    float borderX2 = (1.0 - u_TexCoordinate.x) * size.y / size.x - borderRadius;
    float borderY2 = (1.0 - u_TexCoordinate.y - borderRadius);
    float borderDistance = borderX * borderX + borderY * borderY;
    float borderDistance2 = borderX2 * borderX2 + borderY2 * borderY2;
    if(roundedEdges){
        if((((distance < radius * radius) || (distance2 < radius * radius)) ||
        (u_TexCoordinate.x > unscaledRadius && u_TexCoordinate.x < 1.0 - unscaledRadius)) &&
        (u_TexCoordinate.x > xBorderSize && u_TexCoordinate.y > borderSize) &&
        (u_TexCoordinate.x < (1.0 - xBorderSize) && u_TexCoordinate.y < (1.0 - borderSize))){
            gl_FragColor = texture2D(u_Texture, v_TexCoordinate) * color;
        } else if ((((borderDistance < borderRadius * borderRadius) || (borderDistance2 < borderRadius * borderRadius)) ||
        (u_TexCoordinate.x > unscaledRadius && u_TexCoordinate.x < 1.0 - unscaledRadius))){
            gl_FragColor = borderColor;
        }
    } else {
        if((u_TexCoordinate.x > xBorderSize && u_TexCoordinate.y > borderSize) &&
        (u_TexCoordinate.x < (1.0 - xBorderSize) && u_TexCoordinate.y < (1.0 - borderSize))){
            gl_FragColor = texture2D(u_Texture, v_TexCoordinate) * color;
        } else {
            gl_FragColor = borderColor;
        }
    }
}
