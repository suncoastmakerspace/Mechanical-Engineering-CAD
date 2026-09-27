// The makerspace badge. Printed once, at the end of the path.
// Raised text on a rounded plate, with a hole so it can go on a lanyard.
$fn = 56;

W = 74;
H = 26;
T = 3.2;
R = 5;

module plate() {
  linear_extrude(T)
    hull() {
      translate([R, R]) circle(R);
      translate([W - R, R]) circle(R);
      translate([R, H - R]) circle(R);
      translate([W - R, H - R]) circle(R);
    }
}

difference() {
  union() {
    plate();
    // Raised text, thick enough to read after a layer or two of squish.
    translate([W / 2 + 3, H / 2, T])
      linear_extrude(1.4)
        text("MAKERSPACE", size = 7.4, halign = "center", valign = "center",
             font = "Liberation Sans:style=Bold");
    // A border, so the edge reads as a badge rather than a plain tag.
    translate([0, 0, T])
      linear_extrude(0.9)
        difference() {
          offset(-1.6) hull() {
            translate([R, R]) circle(R);
            translate([W - R, R]) circle(R);
            translate([R, H - R]) circle(R);
            translate([W - R, H - R]) circle(R);
          }
          offset(-2.6) hull() {
            translate([R, R]) circle(R);
            translate([W - R, R]) circle(R);
            translate([R, H - R]) circle(R);
            translate([W - R, H - R]) circle(R);
          }
        }
  }
  // Lanyard hole.
  translate([8, H / 2, -1]) cylinder(h = T + 4, r = 2.2);
}
