$(function() {
  var $container = $("#graph");
  var graph = Raphael("graph", $container.width(), $container.height());
  graph.stroke_width = 3;
  var $table = $("table");
  var data = [], points = [];
  graph.base_color = Raphael.getColor();
  draw();

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
    $("<td />").text("New point").appendTo(tr);
    $("<td />").text(data[data.length - 1]).appendTo(tr);
    tr.appendTo($table);
    $input.val("");
    graph.clear();
    draw();
    return false;
  });

  function grid(x_count, y_count) {
    var grid_path = "M0.5,0";
    var x_increment = graph.width / x_count;
    var y_increment = graph.height / y_count;
    if (y_increment < 10) {
      y_increment = 10;
    }
    for (var q = 0; q < x_count; q++) {
      if (q) {
        grid_path += "M" + (q * x_increment + .5) + ",0";
      }
      grid_path += "L" + (q * x_increment + .5) + "," + graph.height;
    }
    for (var q = 0; q < y_count; q++) {
      grid_path += "M0," + (q * y_increment + .5) + "L" + graph.width + "," + (q * y_increment + .5);
    }
    grid_path += "M" + (graph.width - .5) + ",0L" + (graph.width - .5) + "," + (graph.height - .5) + "L0," + (graph.height - .5);
    var grid = graph.path(grid_path).attr({fill: "none", "stroke-width": 1, stroke: arguments[2] || "#000"}).toBack();
  }

  function draw() {
    data = [];
    var c = graph.path("M0,0").attr({fill: "none", "stroke-width": graph.stroke_width}),
    bg = graph.path("M0,0").attr({stroke: "none", opacity: .3});

    // Load your data into an array
    $table.find("tr").each(function(i) {
      if ($("td:last", this).length) {
        data.push(parseInt($("td:last", this).text(), 10));
      }
    });
    var values = path(data, graph, points);
    var bg_values = values + "L" + graph.width + "," + graph.height + " 0," + graph.height + "z";
    c.attr({path: values, stroke: graph.base_color});
    bg.attr({path: bg_values, fill: graph.base_color});
    grid(data.length - 1, data.max(), "#ccc");
    var increment_x = graph.width / (data.length - 1);
    var increment_y = graph.height / data.max();
    $table.find("tr").each(function(i) {
      if ($("td:last", this).length) {
        graph.text((i - 1) * increment_x, graph.height - 10, $("td:first", this).text()).attr({"text-anchor": "start"});
      }
    });
    for (var i = 0; i < data.max(); i++) {
      graph.text(10, graph.height - (i * increment_y), i).attr({"text-anchor": "start"});
    }
  }
});

function path(data, graph, points) {
  var path = "", x = 0, y = 0;
  var increment_x = graph.width / (data.length - 1);
  var increment_y = graph.height / data.max();
  var section;
  for (var i = 0, length = data.length; i < length; i++) {
    if (i) {
        x += increment_x;
        path += "S" + [x - 10, (y = graph.height - (data[i] * increment_y) + graph.stroke_width), x, y];
    } else {
        path += "M" + [x, (y = graph.height - (data[i] * increment_y) + graph.stroke_width)];
    }
  }
  return path;
}

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