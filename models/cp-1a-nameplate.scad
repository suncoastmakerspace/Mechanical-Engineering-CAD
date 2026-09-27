// Checkpoint 1a - Nameplate / keychain.
// A base plate, raised text, and one mounting hole placed by number.
$fn = 40;
difference() {
  union() {
    cube([60, 22, 3], center = true);
    translate([2, 0, 1.5])
      linear_extrude(1.6)
        text("MECH", size = 9, halign = "center", valign = "center", font = "Liberation Sans:style=Bold");
  }
  translate([-25, 0, 0]) cylinder(h = 10, r = 2.1, center = true);
}
