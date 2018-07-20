jQuery(document).ready(function($) {
    let cartWrapper = $('.cd-cart-container');
    //product id - you don't need a counter in your real project but you can use your real product id
    let productId = 0;

    let cartBody = cartWrapper.find('.body');
    let cartList = cartBody.find('ul').eq(0);
    let cartTotal = cartWrapper.find('.checkout').find('span');
    let cartTrigger = cartWrapper.children('.cd-cart-trigger');
    let cartCount = cartTrigger.children('.count');

    let addToCartBtn = $('.add-button');
    let undo = cartWrapper.find('.undo');
    let undoTimeoutId;

    //add product to cart
    // $(".row").on('click', ".add-button",function(event) {
    //     event.preventDefault();
    //     addToCart($(this));
    // });
    $(".row").on('click','.add-button',function (event) {
        event.preventDefault();
        addToCart($(this));
        event.stopPropagation();    //停止事件冒泡
    });

    //open/close cart
    cartTrigger.on('click', function(event) {
        event.preventDefault();
        toggleCart();
    });

    //close cart when clicking on the .cd-cart-container::before (bg layer)
    cartWrapper.on('click', function(event) {
        if ($(event.target).is($(this)))
            toggleCart(true);
    });

    //delete an item from the cart
    cartList.on('click', '.delete-item', function(event) {
        event.preventDefault();
        removeProduct($(event.target).parents('.product'));
    });

    //update item quantity
    cartList.on('change', 'select', function(event) {
        quickUpdateCart();
    });

    //reinsert item deleted from the cart
    undo.on('click', 'a', function(event) {
        clearInterval(undoTimeoutId);
        event.preventDefault();
        cartList.find('.deleted').addClass('undo-deleted').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function() {
            $(this).off('webkitAnimationEnd oanimationend msAnimationEnd animationend').removeClass('deleted undo-deleted').removeAttr('style');
            quickUpdateCart();
        });
        undo.removeClass('visible');
    });
    function toggleCart(bool) {
        let cartIsOpen = (typeof bool === 'undefined') ? cartWrapper.hasClass('cart-open') : bool;

        if (cartIsOpen) {
            cartWrapper.removeClass('cart-open');
            //reset undo
            clearInterval(undoTimeoutId);
            undo.removeClass('visible');
            cartList.find('.deleted').remove();

            setTimeout(function() {
                cartBody.scrollTop(0);
                //check if cart empty to hide it
                if (Number(cartCount.find('li').eq(0).text()) == 0)
                    cartWrapper.addClass('empty');
            }, 500);
        } else {
            cartWrapper.addClass('cart-open');
        }
    }

    function addToCart(trigger) {
        let cartIsEmpty = cartWrapper.hasClass('empty');
        //update cart product list
        let price = trigger.data('price'),
                proname = trigger.data('proname'),
                proid = trigger.data('proid'),
                proimg = trigger.data('proimg');
        addProduct(proname, proid, price, proimg);
        //console.log();

        //update number of items 
        updateCartCount(cartIsEmpty);
        //update total price
        updateCartTotal(trigger.data('price'), true);
        //show cart
        cartWrapper.removeClass('empty');
    }

    function addProduct(proname, proid, price, proimg) {

        productId = productId + 1;

        let quantity = $("#cd-product-" + proid).text();
        console.log(quantity);

        if (quantity == '') {
            let select = '<span class="select">x<i id="cd-product-' + proid + '">1</i></span>';
            let productAdded = $('<li class="product">' +
                '<div class="product-image">' +
                '<a href="#0"><img src="' + proimg + '" alt="placeholder"></a></div>' +
                '<div class="product-details">' +
                '<h3><a href="#0">' + proname + '</a></h3>' +
                '<span class="price">￥' + price + '</span>' +
                '<div class="actions">' +
                '<a href="#0" class="delete-item">删除</a>' +
                '<div class="quantity"><label for="cd-product-' + proid + '">件数</label>' + select + '</div>' +
                '</div></div></li>');
            cartList.prepend(productAdded);
        } else {
            quantity = parseInt(quantity);
            //let select = '<span class="select">x<i id="cd-product-'+proid+'">'+quantity+'</i></span>';
            $("#cd-product-" + proid).html(quantity + 1);
        }
    }

    function removeProduct(product) {
        clearInterval(undoTimeoutId);
        cartList.find('.deleted').remove();

        let topPosition = product.offset().top - cartBody.children('ul').offset().top,
                productQuantity = Number(product.find('.quantity').find('.select').find('i').text()),
                productTotPrice = Number(product.find('.price').text().replace('￥', '')) * productQuantity;

        product.css('top', topPosition + 'px').addClass('deleted');

        //update items count + total price
        updateCartTotal(productTotPrice, false);
        updateCartCount(true, -productQuantity);
        undo.addClass('visible');

        //wait 8sec before completely remove the item
        undoTimeoutId = setTimeout(function() {
            undo.removeClass('visible');
            cartList.find('.deleted').remove();
        }, 8000);
    }

    function quickUpdateCart() {
        let quantity = 0;
        let price = 0;

        cartList.children('li:not(.deleted)').each(function() {
            let singleQuantity = Number($(this).find('.select').find('i').text());
            quantity = quantity + singleQuantity;
            price = price + singleQuantity * Number($(this).find('.price').text().replace('￥', ''));
        });

        cartTotal.text(price.toFixed(2));
        cartCount.find('li').eq(0).text(quantity);
        cartCount.find('li').eq(1).text(quantity + 1);
    }

    function updateCartCount(emptyCart, quantity) {
        if (typeof quantity === 'undefined') {
            let actual = Number(cartCount.find('li').eq(0).text()) + 1;
            let next = actual + 1;

            if (emptyCart) {
                cartCount.find('li').eq(0).text(actual);
                cartCount.find('li').eq(1).text(next);
            } else {
                cartCount.addClass('update-count');

                setTimeout(function() {
                    cartCount.find('li').eq(0).text(actual);
                }, 150);

                setTimeout(function() {
                    cartCount.removeClass('update-count');
                }, 200);

                setTimeout(function() {
                    cartCount.find('li').eq(1).text(next);
                }, 230);
            }
        } else {
            let actual = Number(cartCount.find('li').eq(0).text()) + quantity;
            let next = actual + 1;

            cartCount.find('li').eq(0).text(actual);
            cartCount.find('li').eq(1).text(next);
        }
    }

    function updateCartTotal(price, bool) {
        bool ? cartTotal.text((Number(cartTotal.text()) + Number(price)).toFixed(2)) : cartTotal.text((Number(cartTotal.text()) - Number(price)).toFixed(2));
    }
});