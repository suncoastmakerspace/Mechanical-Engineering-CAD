// Checkpoint 4c - Capstone reference: a coaster with a raised lip and a
// drainage channel. Stands in for "something you actually need".
$fn = 56;
difference() {
  cylinder(h = 8, r = 45);
  translate([0, 0, 2.5]) cylinder(h = 8, r = 41);
  for (i = [0 : 5])
    rotate([0, 0, i * 60])
      translate([0, 0, 1.2])
        cube([90, 4, 3], center = true);
}
