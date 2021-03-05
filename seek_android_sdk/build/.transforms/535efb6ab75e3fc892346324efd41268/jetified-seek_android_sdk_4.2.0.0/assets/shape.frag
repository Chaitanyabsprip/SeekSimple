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
uniform vec4 color;
uniform int shape;
varying vec2 v_TexCoordinate;

void main() {
    if(shape == 0){
        // rectangle
        gl_FragColor = color;
    } else if(shape == 1){
        // oval
        float radius = 0.5;
        float x = v_TexCoordinate.x - radius;
        float y = v_TexCoordinate.y - radius;
        float distance = x * x + y * y;
        if(distance < radius * radius){
            gl_FragColor = color;
        }
    } else if (shape == 2){
        // equilateral triangle
        if(v_TexCoordinate.x > 0.5){
            if(v_TexCoordinate.x <= v_TexCoordinate.y / 2.0 + 0.5){
                gl_FragColor = color;
            }
        } else {
            if(v_TexCoordinate.x >= 0.5 - v_TexCoordinate.y / 2.0){
                gl_FragColor = color;
            }
        }
    } else if(shape == 3){
        // right triangle
        if(v_TexCoordinate.x <= v_TexCoordinate.y){
            gl_FragColor = color;
        }
    }
}
