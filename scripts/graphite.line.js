$(function() {
  var $container = $("#graph");
  var graph = Raphael("graph", $container.width(), $container.height());
  graph.stroke_width = 3;
  var $table = $("table");
  var data = [], points = [], labels = [];
  $table.find("tr").each(function(i) {
    if ($("td:last", this).length) {
      data.push(parseInt($("td:last", this).text(), 10));
      labels.push($("td:first", this).text());
    }
  });
  var graphite = new Graphite(graph, data, labels);
  graphite.draw();
  graphite.labels();

  $("form").submit(function() {
    var tr = $("<tr />");
    var $input = $("input", this);
    var value = parseInt($input.val(), 10);
    if (isNaN(value)) {
      $("form p").text("Enter a number");
      return false;
    }
    if ((value + "").length != $input.val().length) {
      $("form p").text("Invalid character(s) - integers only");
      return false;
    }
    if (value < 0) {
      $("form p").text("Must be a positive number");
      return false;
    }
    data.push(parseInt($input.val(), 10));
    labels.push("New point");
    $("<td />").text("New point").appendTo(tr);
    $("<td />").text(data[data.length - 1]).appendTo(tr);
    tr.appendTo($table);
    $input.val("");
    graph.clear();
    graphite.data = data;
    graphite.draw();
    graphite.labels();
    return false;
  });
});

Array.prototype.max = function() {
  var max = this[0];
  var len = this.length;
  for (var i = 1; i < len; i++) if (this[i] > max) max = this[i];
  return max;
}

Array.prototype.min = function() {
  var min = this[0];
  var len = this.length;
  for (var i = 1; i < len; i++) if (this[i] < min) min = this[i];
  return min;
}

function Graphite() {
  var graph = arguments[0];
  var data = arguments[1];
  var labels = arguments[2];
  var defaults = {
    bezier_curve: 10,
    draw_grid: true,
    draw_legends: true,
    width: graph.canvas.clientWidth,
    height: graph.canvas.clientHeight,
    gutter_x: 20,
    gutter_y: 20,
    color: Raphael.getColor(),
    point: {
      radius: 5
    },
    tooltip: {
      width: 60,
      height: 25,
      radius: 3,
      fill: "#ffffff",
      stroke: "#666666",
      duration: 200
    },
    tooltip_text: {
      font: "normal 12px Arial, Helvetica, sans-serif",
      color: "#333333"
    }
  }
  defaults.point.color = defaults.color;
  var opts = $.extend(defaults, arguments[3] || {});

  this.path = function(data, graph) {
    var path = "", x = opts.gutter_x || 0, y = 0;
    var increment_x = (opts.width / (data.length - 1)) - (x * 2) / (data.length - 1);
    var increment_y = (opts.height - opts.gutter_y * 2) / data.max();
    var section;
    var tags = [];
    for (var i = 0, length = data.length; i < length; i++) {
      if (i) {
        x += increment_x;
        path += "S" + [x - opts.bezier_curve, (y = opts.height - (data[i] * increment_y) +
                (graph.stroke_width / 2) - opts.gutter_y), x, y];
      } else {
        path += "M" + [x, (y = opts.height - (data[i] * increment_y) + (graph.stroke_width / 2) - opts.gutter_y)];
      }
      tags[i] = this.point(x, y, labels[i]);
    }
    return path;
  }

  this.draw = function() {
    var c = graph.path("M0,0").attr({fill: "none", "stroke-width": graph.stroke_width}),
    bg = graph.path("M0,0").attr({stroke: "none", opacity: .3});
    var values = this.path(data, graph);
    var bg_values = values + "L" + (opts.width - opts.gutter_x) + "," + (opts.height - opts.gutter_y) +
                    " " + opts.gutter_x + "," + (opts.height - opts.gutter_y) + "z";
    c.attr({path: values, stroke: opts.color});
    bg.attr({path: bg_values, fill: opts.color});
    if (opts.draw_grid) {
      this.grid(data.length - 1, data.max(), "#ccc");
    }
    var increment_x = opts.width / (data.length - 1);
    var increment_y = opts.height / data.max();
  }

  this.labels = function() {
    var increment_x = (opts.width - (opts.gutter_x * 2)) / (data.length - 1);
    var increment_y = (opts.height - (opts.gutter_y * 2)) / data.max();
    $.each(labels, function(i, label) {
      graph.text(i * increment_x + opts.gutter_x, opts.height - opts.gutter_y / 2, label).attr({"text-anchor": "center"});
    });
    for (var i = 0; i <= data.max(); i++) {
      graph.text(opts.gutter_x - 2, opts.height - (i * increment_y + opts.gutter_y), i).attr({"text-anchor": "end"});
    }
  }

  this.grid = function(x_count, y_count) {
    var grid_path = "M" + opts.gutter_x + ".5," + opts.gutter_y;
    var x_increment = (opts.width - (opts.gutter_x * 2)) / x_count;
    var y_increment = (opts.height - (opts.gutter_y * 2)) / y_count;
    var inner_width = opts.width - opts.gutter_x;
    var inner_height = opts.height - opts.gutter_y;
    if (y_increment < 10) {
      y_increment = 10;
      y_count = (opts.height - opts.gutter_y * 2) / y_increment;
    }
    for (var q = 0; q < x_count; q++) {
      if (q) {
        grid_path += "M" + (q * x_increment + opts.gutter_x + .5) + "," + opts.gutter_y;
      }
      grid_path += "L" + (q * x_increment + opts.gutter_x + .5) + "," + (opts.height - opts.gutter_y);
    }
    for (var q = 0; q < y_count; q++) {
      grid_path += "M" + opts.gutter_x + "," + (q * y_increment + opts.gutter_y + .5) + "L" +
                   inner_width + "," + (q * y_increment + opts.gutter_y + .5);
    }
    grid_path += "M" + (inner_width - .5) + "," + opts.gutter_y + "L" + (inner_width - .5) + "," +
                 (inner_height - .5) + "L" + opts.gutter_x + "," + (inner_height - .5);
    var grid = graph.path(grid_path).attr({fill: "none", "stroke-width": 1, stroke: arguments[2] || "#000"}).toBack();
  }

  this.point = function(x, y, point_label) {
    var offset = opts.point.radius / 2;
    var point = graph.circle(x, y, opts.point.radius)
                  .attr({fill: opts.point.color, stroke: "none"});
    if (x >= opts.width - opts.tooltip.width) {
      x = opts.width - opts.tooltip.width - offset - opts.gutter_x - 1;
    }
    if (y >= opts.height - opts.tooltip.height) {
      y = opts.height - opts.tooltip.height - offset - opts.gutter_y - 1;
    }
    var tag = graph.set(
      graph.rect(x + offset, y + offset, opts.tooltip.width, opts.tooltip.height, opts.tooltip.radius).attr({
        fill: opts.tooltip.fill,
        stroke: opts.tooltip.stroke,
        "stroke-width": 1,
        opacity: 0
      }),
      graph.text(x + opts.tooltip.width / 2, y + opts.tooltip.height / 2, point_label).attr({
        font: opts.tooltip_text.font,
        fill: opts.tooltip_text.color,
        opacity: 0
      })
    );
    $(point.node).css({cursor: "pointer"});
    $(point.node).hover(function() {
      $.each(tag, function(i, el) {
        el.animate({opacity: 1}, opts.tooltip.duration);
      });
    }, function() {
      $.each(tag, function(i, el) {
        el.animate({opacity: 0}, opts.tooltip.duration);
      });
    });
    if (typeof arguments[3] === "function") { arguments[3](tag); }
    return tag;
  }
}