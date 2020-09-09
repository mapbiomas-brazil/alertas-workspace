import {
    ComponentFactoryResolver,
    Injectable,
    Injector,
    ApplicationRef
} from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ComponentLoaderService {

    constructor(
        private injector: Injector,
        private factoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef
    ) { }

    load(component: any) {

        let compFactory = this.factoryResolver.resolveComponentFactory(component);

        let compRef = compFactory.create(this.injector);

        this.appRef.attachView(compRef.hostView);

        compRef.onDestroy(() => this.appRef.detachView(compRef.hostView));

        return compRef.location.nativeElement;
    }

}