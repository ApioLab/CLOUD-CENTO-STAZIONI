#!/bin/bash
cd /home/azureuser/ApioOS
forever start -s -c "node --expose_gc" app.js
