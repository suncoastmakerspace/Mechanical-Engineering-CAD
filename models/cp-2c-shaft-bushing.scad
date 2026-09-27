// Checkpoint 2c - Shaft and bushing, with a real clearance fit.
// Bushing bore is 0.4mm over the shaft, which is what lets it turn.
$fn = 64;
SHAFT = 8;
CLEARANCE = 0.4;
translate([-16, 0, 0]) cylinder(h = 46, r = SHAFT / 2);
translate([16, 0, 0])
  difference() {
    cylinder(h = 18, r = 9);
    translate([0, 0, -1]) cylinder(h = 20, r = (SHAFT + CLEARANCE) / 2);
  }
