// Checkpoint 1b - Enclosure box with a lipped lid.
// Shown open, lid beside the box, so the step that makes it seat is visible.
$fn = 48;
WALL = 2;
module box() {
  difference() {
    cube([50, 34, 20], center = true);
    translate([0, 0, WALL]) cube([50 - 2 * WALL, 34 - 2 * WALL, 20], center = true);
  }
}
module lid() {
  union() {
    cube([50, 34, 2], center = true);
    // The lip: slightly undersize so it drops into the cavity.
    translate([0, 0, 2]) cube([50 - 2 * WALL - 0.4, 34 - 2 * WALL - 0.4, 2], center = true);
  }
}
box();
translate([0, 46, 0]) lid();
