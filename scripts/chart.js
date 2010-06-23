$(function() {
  var r = Raphael("graph", 620, 250),
    e = [],
    clr = [],
    months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    values = [],
    now = 0,
    c = r.path("M0,0").attr({fill: "none", "stroke-width": 3}),
    bg = r.path("M0,0").attr({stroke: "none", opacity: .3}),
    dotsy = [];

  function path(length, j) {
    var path = "", x = 10, y = 0;
    var increment = 20;
    dotsy = [];
    for (var i = 0; i < length; i++) {
      dotsy[i] = Math.round(Math.random() * 200);
      if (i) {
          //path += "C" + [x + 10, y, (x += 20) - 10, (y = 240 - dotsy[j][i]), x, y];
          path += "S" + [(x += increment) - 10, (y = 240 - dotsy[i]), x, y];
      } else {
          path += "M" + [10, (y = 240 - dotsy[i])];
      }
    }
    return path;
  }

  values = path(30, 0);
  clr = Raphael.getColor(1);

  c.attr({path: values, stroke: clr});
  bg.attr({path: values + "L590,250 10,250z", fill: clr});

  $("body").ready(function() {
    $("svg desc").text("Hi there!");
  });

  $("a").click(function() {
    var colors = ["#ff0000", "#00ff00", "#0000ff"];
    var idx = $.inArray($(c.node).attr("stroke"), colors) + 1;
    if (idx == colors.length) { idx = 0; }
    $(c.node).fadeOut(1000, function () {
      c.attr({stroke: colors[idx]});
      $(this).fadeIn(500);
    });
    $(bg.node).fadeOut(1000, function() {
      bg.attr({fill: colors[idx]});
      $(this).fadeIn(500);
    });
    return false;
  });
});