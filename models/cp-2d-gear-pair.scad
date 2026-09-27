// Checkpoint 2d - A meshing gear pair. Teeth are trapezoidal rather than a
// true involute: this is a reference for the mechanism, not a gear to cut.
$fn = 24;
module gear(teeth, r, thick) {
  union() {
    cylinder(h = thick, r = r);
    for (i = [0 : teeth - 1])
      rotate([0, 0, i * 360 / teeth])
        translate([r, 0, 0])
          linear_extrude(thick)
            polygon([[0, -2.2], [0, 2.2], [3.2, 1.2], [3.2, -1.2]]);
  }
}
difference() { gear(16, 16, 6); translate([0, 0, -1]) cylinder(h = 8, r = 3); }
translate([16 + 12 + 3, 0, 0])
  difference() { gear(12, 12, 6); translate([0, 0, -1]) cylinder(h = 8, r = 3); }
