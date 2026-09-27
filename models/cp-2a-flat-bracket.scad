// Checkpoint 2a - The same bracket rebuilt as a constrained sketch, flat.
// Fillets on the outline are the visible sign it came from a sketch.
$fn = 48;
T = 5;
R = 6;
linear_extrude(T)
  difference() {
    hull() {
      translate([R, R]) circle(R);
      translate([64 - R, R]) circle(R);
      translate([R, 30 - R]) circle(R);
      translate([64 - R, 30 - R]) circle(R);
    }
    for (x = [12, 52]) translate([x, 15]) circle(3.2);
    translate([32, 15]) circle(7);
  }
