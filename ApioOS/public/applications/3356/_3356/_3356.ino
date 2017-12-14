
#include "Apio.h"
#include "property.h"
void setup() {
	Apio.setup("Ticket", "1,0", 123456789, 0x01);
}

void loop(){
	Apio.loop();
}