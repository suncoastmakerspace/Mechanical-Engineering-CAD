// Checkpoint 1c - L bracket, two holes per face, gusset at the corner.
$fn = 36;
T = 4;
module face(l, w) { cube([l, w, T], center = false); }
difference() {
  union() {
    face(40, 30);
    translate([0, 0, 0]) rotate([0, -90, 0]) face(40, 30);
    /*
     * Gusset, so the corner is not a sharp unsupported joint.
     *
     * The first version had this translated to z=-40 and pointing at +z, which
     * left it floating in space away from a corner that stayed bare. The
     * review caught it before I did.
     *
     * rotate([90,0,0]) maps (x,y,z) -> (x,-z,y). The two faces run along +x
     * and +z, so the triangle is authored in +x/+y and lands spanning +x/+z,
     * then is shifted into y = 0..T to sit flush against them. Checked by
     * bounding box, not by eye: an earlier attempt pointed it at -z and only
     * the bounds showed it.
     */
    translate([0, T, 0])
      rotate([90, 0, 0])
        linear_extrude(T)
          polygon([[0, 0], [24, 0], [0, 24]]);
  }
  for (y = [8, 22]) translate([26, y, -1]) cylinder(h = T + 2, r = 1.7);
  for (y = [8, 22]) translate([-1, y, -26]) rotate([0, 90, 0]) cylinder(h = T + 2, r = 1.7);
}
