/**************************************************************************\
* Apio Library                                                         *
* https://github.com/Apio/library-Apio                             *
* Copyright (c) 2012-2014, Apio Inc. All rights reserved.              *
* ------------------------------------------------------------------------ *
*  This program is free software; you can redistribute it and/or modify it *
*  under the terms of the BSD License as described in license.txt.         *
\**************************************************************************/
#ifndef LIB_Apio_H_
#define LIB_Apio_H_

//#define Apio_DEBUG
#ifdef Apio_DEBUG
#  define D(x) x
#else
#  define D(x)
#endif

#define LIMIT 25


#include <Arduino.h>

#include "sysConfig.h"
#include "phy.h"
#include "hal.h"
#include "sys.h"
#include "nwk.h"
#include "sysTimer.h"
#include "halTemperature.h"
#include <avr/sleep.h>
#include "StringBuffer.h"
#include "String.h"

class ApioClass {

 public:
   ApioClass();
   ~ApioClass();
   uint16_t PanId;
   void setup(const char *sketchName, const char *sketchRevision, const uint16_t theAddress, const uint16_t thePanId);
   void loop();

   void goToSleep(uint32_t sleepForMs);

   int8_t getTemperature();
   int8_t getTemperatureOffset(void);
   void setTemperatureOffset(int8_t offset);
   void enableExternalAref();
   void disableExternalAref();
   bool getExternalAref();

   const char* getLastResetCause();
   void loadSettingsFromEeprom();
   void eraseEeprom();
   void saveEepromAddress(const uint16_t theAddress, const uint16_t thePanId, const uint8_t theChannel);

   void setHQToken(const char *token);
   void getHQToken(char *token);
   void resetHQToken();
   void setOTAFlag();

   uint32_t getHwSerial();
   uint16_t getHwFamily();
   uint8_t getHwVersion();
   uint8_t getEEPROMVersion();

   //void sendStateToHQ();

   void meshSetRadio(const uint16_t theAddress, const uint16_t thePanId, const uint8_t theChannel);
   void meshSetChannel(const uint8_t theChannel);
   void meshSetPower(const uint8_t theTxPower);
   void meshSetDataRate(const uint8_t theRate);
   void meshSetSecurityKey(const uint8_t *key);
   void meshGetSecurityKey(char *key);
   void meshResetSecurityKey(void);
   void meshListen(uint8_t endpoint, bool (*handler)(NWK_DataInd_t *ind));

   void meshJoinGroup(uint16_t groupAddress);
   void meshLeaveGroup(uint16_t groupAddress);
   bool meshIsInGroup(uint16_t groupAddress);


   String propertyReceived[LIMIT];
   String valueReceived[LIMIT];
   int indexReceived = 0;

   String mex = "";
   String sendTo = "";

   int contatoreInvii=0;
   int ack;
   int flagSend = 0;
   int sendInLoop = 0;
   String codaInvio;

   //Fade Effect
   int brightness=0;
   int fadeAmount = 5;
   int brightnessNeg;
   int currMillis;
   int preMillis;
   int fadeOn;
   int delFade = 5;

   void fade(int del, int flagFade);

   void send(String message="");

   uint16_t getAddress();
   uint16_t getPanId();
   uint8_t getChannel();
   uint8_t getTxPower();
   const char* getTxPowerDb();
   uint8_t getDataRate();
   const char* getDataRatekbps();


   String appId;

   //Ex readFromWebServer
   char readFromSerial();

   int nwkDataReqB;
   //int a = 0;

   const char* getSketchName();
   const char* getSketchRevision();
   int32_t getSketchBuild();
   int isDongle;
   //Ex content

   String deviceAddr;
   String property;
   String value;

   int flagDeleted = 0;


   uint32_t now = 0; // set every loop
   uint8_t indicate = 0; // how often to signal status

   int hi = 0;

   int isVerbose = 0;

   long previousMillis = 0;
   long interval = 1000;

   String theAdd = "";
   int flagNoLoop = 0;
   String exSend;




 protected:
   void convertLongToBytes(byte *convBytes, uint32_t target);
   uint32_t convertBytesToLong(byte *convBytes);
   uint32_t lastIndicate = 0;

   bool isExternalAref;
   uint8_t lastResetCause;
   uint16_t address;
   uint16_t panId;
   uint8_t channel;
   uint8_t txPower;
   uint8_t dataRate;
   int8_t tempOffset;

   // Name of the sketch (e.g. "Bootstrap")
   const char* sketchName;
   // Detailed revision of the sketch (e.g. "2014031902-1-g5579a21-dirty")
   const char* sketchRevision;
   // Released build number, or -1 for custom builds
   int32_t sketchBuild;
};

extern ApioClass Apio;

#endif
