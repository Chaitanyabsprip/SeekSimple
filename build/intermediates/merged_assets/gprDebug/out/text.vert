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
uniform mat4 u_MVPMatrix[24];// An array representing the combined
// model/view/projection matrices for each sprite

attribute float a_MVPMatrixIndex;// The index of the MVPMatrix of the particular sprite
attribute vec4 a_Position;// Per-vertex position information we will pass in.
attribute vec2 a_TexCoordinate;// Per-vertex texture coordinate information we will pass in
varying vec2 v_TexCoordinate;// This will be passed into the fragment shader.
void main()// The entry point for our vertex shader.
{
    int mvpMatrixIndex = int(a_MVPMatrixIndex);
    v_TexCoordinate = a_TexCoordinate;
    gl_Position = u_MVPMatrix[mvpMatrixIndex]// gl_Position is a special variable used to store the final position.
    * a_Position;// Multiply the vertex by the matrix to get the final point in
    // normalized screen coordinates.
}
