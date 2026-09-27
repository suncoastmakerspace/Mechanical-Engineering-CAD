// Checkpoint 4a - Flange with a circular bolt pattern driven by one parameter.
$fn = 40;
BOLTS = 6;
PCD = 46;
difference() {
  union() {
    cylinder(h = 6, r = 32);
    cylinder(h = 18, r = 14);
  }
  translate([0, 0, -1]) cylinder(h = 22, r = 9);
  for (i = [0 : BOLTS - 1])
    rotate([0, 0, i * 360 / BOLTS])
      translate([PCD / 2, 0, -1])
        cylinder(h = 8, r = 2.6);
}
