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
  // Base plate: axis along +z, spanning the plate's z = 0..T.
  for (y = [8, 22]) translate([26, y, -1]) cylinder(h = T + 2, r = 1.7);
  /*
   * Upright: axis along +x, and it has to span the upright's x = -4..0.
   *
   * These were at z = -26 and x = -1..5, which is outside the part on both
   * counts, so the upright came out with no holes at all and the bracket had
   * two instead of the four its own brief asks for. The review found it:
   * "only two holes visible on the top face, but the design requires two holes
   * on each face". Started from -5 so the cut clears both faces of the
   * upright rather than dimpling the near one.
   */
  for (y = [8, 22]) translate([-5, y, 26]) rotate([0, 90, 0]) cylinder(h = T + 2, r = 1.7);
}
