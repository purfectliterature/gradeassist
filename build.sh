#!/bin/bash
rm -rf gradeassist-v*/
rm -rf gradeassist-v*.zip
mkdir gradeassist-v$1
cp content.js gradeassist-v$1/content.js
cp manifest.json gradeassist-v$1/manifest.json
cp toast.css gradeassist-v$1/toast.css
cp -r gradeassist-*.png gradeassist-v$1
zip -r gradeassist-v$1.zip gradeassist-v$1
rm -rf gradeassist-v*/