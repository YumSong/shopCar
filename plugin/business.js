jQuery(document).ready(function ($) {
    $.get("http://localhost:3000/posts", function (data, status) {
        if (status == "success") {
            console.log(data);
            write2Menu(data,"#menu_main");
        }
        // console.log("Data: " + data + "\nStatus: " + status);
    });

    function write2Menu(data,menu_id) {
        let menu_main = $(menu_id);
        let html = "";
        $.each(data, (idx, obj) => {
            html += "<div class=\"col-lg-4 col-md-4 col-sm-6 pro text-center\">";
            html += "<div class=\"selectProduct\">";
            html += "<img width=\"300px\" height=\"290\" src=\""+obj.img_url+"\">";
            html += "<h4>"+obj.menu+"</h4>";
            html += `<a class="btn btn-success add-button" data-price="${obj.price}" data-proid="${obj.id}" data-proname="${obj.menu}" data-proimg="${obj.img_url} ">添加到购物车</a>`;
            html += "</div>";
            html += "</div>";
            menu_main.append(html);
            html = "";
        })
    }

});