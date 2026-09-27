// Checkpoint 4b - A hinge: two leaves and a pin, four mated parts.
$fn = 48;
module leaf() {
  difference() {
    union() {
      cube([30, 24, 3]);
      translate([0, 4, 0]) rotate([-90, 0, 0]) cylinder(h = 16, r = 3);
    }
    translate([0, 3, 1.5]) rotate([-90, 0, 0]) cylinder(h = 20, r = 1.6);
    for (x = [10, 22]) translate([x, 16, -1]) cylinder(h = 6, r = 1.7);
  }
}
leaf();
translate([0, 34, 0]) mirror([0, 1, 0]) leaf();
translate([0, -2, 1.5]) rotate([-90, 0, 0]) cylinder(h = 40, r = 1.4);
