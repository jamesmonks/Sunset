$().ready(init);

function init()
{
    attempt_stuff();
    let canvas = $("#perlin2")[0];
    generate_sky_canvas(canvas);
    
    let img_data_url = canvas.toDataURL();
    // document.getElementById("sky-overlay")[0].style.background='url('+img_data_url+')';

    console.log("hello world, let me out!");
    $(".expand-menu-btn").on("click", (event) => {
        console.log(event);
        console.log(event.currentTarget);
        $(event.currentTarget).toggleClass("menu-active");
    });

    $("div.dark-option").on("click", event => {
        $(event.currentTarget).toggleClass("dark-sun");
        if ($(event.currentTarget).hasClass("dark-sun"))
        {
            $("body").removeClass("light-mode");
            $(".option-label").html("LIGHT MODE");
        }
        else
        {
            $("body").addClass("light-mode");
            $(".option-label").html("DARK MODE");
        }
    });

    window.addEventListener("scroll", side_menu_display);
}

function side_menu_display(event) {
    console.log("event", window.scrollY, window.scrollY > 50, $(".expand-menu-btn").hasClass("offstage"));
    if (window.scrollY > 95 && $(".expand-menu-btn").hasClass("offstage"))
        $(".expand-menu-btn").removeClass("offstage");
    if (window.scrollY <= 95 && !($(".expand-menu-btn").hasClass("offstage")))
    {
        $(".expand-menu-btn").addClass("offstage");
        $(".menu-active").removeClass("menu-active");
    }
}